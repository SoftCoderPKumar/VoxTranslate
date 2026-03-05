const { readdir, readFile } = require("fs/promises");
const path = require("path");
const { PDFParse } = require("pdf-parse");
const { Document } = require("@langchain/core/documents");
const { splitterInstance, PineconeUpsertVectors } = require("./langchain");
const { pineconeIndex } = require("./pineconeVectordb");
const { CHAT_SYSTEM_PROMPT, QUERY_TRANSFORM_PROMPT, GROQ_OPENAI_QUERY_TRANSFORM_SYSTEM_PROMPT } = require("./prompt");
const { getGroqAIClient } = require("./groqaiApi");
const { getOpenAIClient } = require("./openaiApi");
const exportData = {}
const history = []


exportData.readAndParsePdfFiles = async (folderName) => {
    // get all files form dir
    const projectDir = process.cwd();
    const dirPath = path.resolve(projectDir, `public/${folderName}`);
    const files = await readdir(dirPath);
    const pdfPromises = files
        .filter((file) => path.extname(file).toLowerCase() === ".pdf")
        .map(async (file, i) => {
            const fullPath = path.join(dirPath, file);
            const dataBuffer = await readFile(fullPath); // Read file as a buffer
            const data = new PDFParse({ data: dataBuffer }); // Parse the PDF data

            return new Document({
                pageContent: await exportData.cleanPdfText((await data.getText()).text), // Extract and clean the text content
                metadata: {
                    source: file,
                    createdAt: new Date().toISOString(),
                    // ...await data.getInfo()
                },
                id: `${i + 1}`,
            });
        });
    return await Promise.all(pdfPromises);
};

exportData.cleanPdfText = async (rawText) => {
    return rawText
        .replace(/\n\s*\n/g, "\n\n") // Normalize double newlines
        .replace(/(\w)-\s+(\w)/g, "$1$2") // Fix words split by hyphens (envi- ronment -> environment)
        .replace(/[^\x20-\x7E\n]/g, "") // Remove non-printable/weird ASCII symbols
        .replace(/Page \d+ of \d+/g, "") // Remove common footer patterns
        .replace(/-+ \d+ of \d+ -+/g, "") // Remove common footer patterns
        .replace(/\n{3,}/g, "\n\n") // Collapse multiple newlines into a maximum of two
        .trim();
}

exportData.splitDocuments = async (
    documents
) => {
    const splitter = await splitterInstance({
        chunkSize: 1000,
        chunkOverlap: 200,
    });
    const splitDocs = await splitter.splitDocuments(documents);
    const documentsArr = [];
    for (let i = 0; i < splitDocs.length; i++) {
        documentsArr.push(
            await exportData.updateMetadataOfDocument(
                splitDocs[i].pageContent,
                splitDocs[i].metadata,
                i + 1,
            ),
        );
    }
    return documentsArr;
};

exportData.updateMetadataOfDocument = async (
    pageContent,
    metadata,
    id,
) => {
    return new Document({
        pageContent,
        metadata: { source: metadata.source, createdAt: metadata.createdAt },
        id: `${id}`,
    });
};

exportData.vectorStoreInstance = async () => {
    switch (process.env.VECTOR_DB_TYPE) {
        case "pinecone":
            return await pineconeIndex()
        default:
            throw new Error("Invalid VECTOR_DB_TYPE specified in environment variables.");
    }
}

exportData.uploadToVectorStore = async (chunkedDocs, embedder, vectorStore) => {
    if (!chunkedDocs || chunkedDocs.length === 0) {
        throw new Error("No documents provided for embedding.");
    }
    switch (process.env.VECTOR_DB_TYPE) {
        case "pinecone":
            return await PineconeUpsertVectors(chunkedDocs, embedder, vectorStore);
        default:
            throw new Error("Invalid VECTOR_DB_TYPE specified in environment variables.");
    }
}

exportData.generateGroqOrOpenaiInstance = async (provider, userId) => {
    try {
        if (provider === 'groq')
            return await getGroqAIClient(userId);
        else if (provider === 'openai')
            return await getOpenAIClient(userId);
        else
            throw new Error('Unsupported provider');
    } catch (error) {
        throw new Error('Error generating AI client: ' + error.message);
    }
}



exportData.transformQuery = async (query, ai) => {
    try {
        history.push({
            role: 'user',
            parts: [{ text: query }]
        })
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: history,
            generationConfig: {
                maxOutputTokens: 100, // Stop the model from "thinking" too long
                temperature: 0.1,    // Low temperature makes the response faster/more direct
            },
            config: {
                systemInstruction: `${QUERY_TRANSFORM_PROMPT}`,

            },
        });

        history.pop()

        return response.text
    }
    catch (error) {
        if (error.status === 429) {
            throw new Error("Quota exceeded! Try again in a few seconds.");
        } else {
            throw new Error("An error occurred: " + error.message);
        }
    }
}

exportData.chattingWithAI = async (context, transformedQuery, ai) => {
    try {
        const prompt = `
Context:
${context}

User Question:
${transformedQuery}
`;
        history.push({
            role: 'user',
            parts: [{ text: prompt }]
        })
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",

            contents: history.slice(-2),
            maxOutputTokens: 300, // Stop the model from "thinking" too long
            temperature: 0.3,    // Low temperature makes the response faster/more direct
            config: {
                systemInstruction: `${CHAT_SYSTEM_PROMPT}`
            }
        });
        history.push({
            role: 'model',
            parts: [{ text: response.text }]
        })
        return response.text;
    } catch (error) {
        if (error.status === 429) {
            throw new Error("Quota exceeded! Try again in a few seconds.");
        } else {
            throw new Error("An error occurred: " + error.message);
        }
    }
}

exportData.transformQueryWithGroqOrOpenai = async (query, ai, provider) => {
    try {
        const model = provider === 'openai' ? 'gpt-4o-mini' : 'llama-3.3-70b-versatile'
        const response = await ai.chat.completions.create({
            model: model,
            messages: [
                { role: 'system', content: GROQ_OPENAI_QUERY_TRANSFORM_SYSTEM_PROMPT },
                { role: 'user', content: query },
            ],
            temperature: 0,
            response_format: { type: 'text' },
        });
        const result = response.choices[0].message.content.trim();
        return result
    }
    catch (error) {
        if (error.status === 429) {
            throw new Error("Quota exceeded! Try again in a few seconds.");
        } else if (error.message.includes("Unexpected token")) {
            throw new Error("Received an invalid response from the AI provider. This may be a temporary issue. Please try again.");
        } else {
            throw new Error("An error occurred: " + error.message);
        }
    }
}

exportData.generateAnswerWithGroqOrOpenai = async (context, transformedQuery, ai, provider) => {
    try {
        history.push({
            role: "user",
            content: transformedQuery
        });
        const recentHistory = history.slice(-6);
        const model = provider === 'openai' ? 'gpt-4o-mini' : 'llama-3.3-70b-versatile'
        const prompt = `
Context:
${context}

User Question:
${transformedQuery}
`;
        const response = await ai.chat.completions.create({
            model: model,
            messages: [
                { role: 'system', content: CHAT_SYSTEM_PROMPT },
                ...recentHistory,
                { role: 'user', content: prompt },
            ],
            temperature: 0.3,
            response_format: { type: 'text' },
        });

        const answer = response.choices[0].message.content.trim();
        console.log("AI Response:", answer);
        history.push({
            role: "assistant",
            content: answer
        });
        if (history.length > 20) {
            history.splice(0, history.length - 20);
        }
        return answer;
    }
    catch (error) {
        if (error.status === 429) {
            throw new Error("Quota exceeded! Try again in a few seconds.");
        } else if (error.message.includes("Unexpected token")) {
            throw new Error("Received an invalid response from the AI provider. This may be a temporary issue. Please try again.");
        } else {
            throw new Error("An error occurred: " + error.message);
        }
    }
}
module.exports = exportData