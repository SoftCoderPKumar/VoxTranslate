const { readdir, readFile } = require("fs/promises");
const path = require("path");
const { PDFParse } = require("pdf-parse");
const { Document } = require("@langchain/core/documents");
const { splitterInstance, PineconeUpsertVectors } = require("./langchain");
const { pineconeIndex } = require("./pineconeVectordb");
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

exportData.transformQuery = async (query, ai) => {
    try {
        history.push({
            role: 'user',
            parts: [{ text: query }]
        })
        const response = await ai.models.generateContent({
            model: process.env.TEXT_MODEL || "gemini-3-flash-preview",
            contents: history,
            generationConfig: {
                maxOutputTokens: 100, // Stop the model from "thinking" too long
                temperature: 0.1,    // Low temperature makes the response faster/more direct
            },
            config: {
                systemInstruction: `You are a query rewriting expert. Based on the provided chat history, rephrase the "Follow Up user Question" into a complete, standalone question that can be understood without the chat history. Only output the rewritten question and nothing else.`,
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

exportData.chattingWithAI = async (queries, ai) => {
    try {
        history.push({
            role: 'user',
            parts: [{ text: queries }]
        })
        const response = await ai.models.generateContent({
            model: process.env.TEXT_MODEL || "gemini-3-flash-preview",

            contents: history.slice(-2),
            // generationConfig: {
            maxOutputTokens: 100, // Stop the model from "thinking" too long
            temperature: 0.7,    // Low temperature makes the response faster/more direct

            // },
            config: {
                systemInstruction: `${process.env.SYSTEM_PROMPT}
      
                Context: ${queries}`,
            },
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

module.exports = exportData