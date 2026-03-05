const { validationResult } = require("express-validator");
const { readAndParsePdfFiles, splitDocuments, vectorStoreInstance, uploadToVectorStore, transformQuery, chattingWithAI } = require("../utils/util");
const { embedderInstance, generativeAiInstance } = require("../utils/langchain");

const exportData = {};
let chunkedDocs = [];

/**
 * POST /api/genai/chatbot
 * Returns a response to the given query
 * @param {Object} req.body - contains the query
 * @return {Object} - response with status, message and the response to the query
 * @throws {Error} - if validation fails or there is an unexpected error
 */
exportData.chatbotPost = async (req, res, next) => {
    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', errors: errors.array() });
        }

        const { query } = req.body;

        // 1. Initialize the embedder
        const embedder = await embedderInstance();

        // 2. Initialize the generative AI model
        const ai = await generativeAiInstance();

        // 3. Transform the user query to be more effective for retrieval
        const queries = await transformQuery(query, ai);

        // 4.  Convert the user query into embedding(vector)
        const queryVector = await embedder.embedQuery(queries);

        // 5. initialize the vector store
        const vectorStore = await vectorStoreInstance();

        // 6. Search for relevant documents in the vector store using the query vector
        const searchResults = await vectorStore.query({ topK: 2, vector: queryVector, includeMetadata: true, });

        // 7. Extract the relevant context from the search results and generate a response using the language model
        const context = searchResults.matches
            .map(match => match.metadata.text)
            .join("\n\n---\n\n");

        // 8. Generate the final response using the context and the original question
        const finalResponse = await chattingWithAI(context, queries, ai);

        res.status(200).json({ status: true, message: 'Response generated successfully.', res: finalResponse });
    } catch (error) {
        next(error)
    }
};
/**
 * POST /api/genai/embedding-vector
 * Stores given form and to in vector database
 * @param {Object} req.body - contains form and to
 * @return {Object} - response with status, message and stored data
 * @throws {Error} - if validation fails or there is an unexpected error
 */
exportData.embeddingVectorPost = async (req, res, next) => {
    try {
        // error handling
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', errors: errors.array() });
        }

        // get form and to data
        const { from, to } = req.body;

        if (chunkedDocs.length === 0) {

            //  1. Read and parse PDF files to get their content as documents
            const rawDocs = await readAndParsePdfFiles(process.env.PDF_FOLDER_NAME);

            // 2. Initialize the splitter
            chunkedDocs = await splitDocuments(rawDocs);
        }

        // 3. Initialize the embedder
        const embedder = await embedderInstance();

        // 4. initialize the vector store
        const vectorStore = await vectorStoreInstance();

        // 5. Upload the chunked documents to the vector store
        await uploadToVectorStore(chunkedDocs.slice(from, to), embedder, vectorStore);


        res.status(200).json({ status: true, message: 'Data Stored successfully in vector database.', res: chunkedDocs });


    } catch (error) {
        next(error)
    }
};

module.exports = exportData;