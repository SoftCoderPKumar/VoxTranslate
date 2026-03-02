
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { TaskType } = require("@google/generative-ai");
const { GoogleGenAI } = require("@google/genai");
const { PineconeStore } = require('@langchain/pinecone');
const { DefaultEmbeddingFunction } = require("@chroma-core/default-embed");
const exportData = {}

exportData.splitterInstance = async (configInfo = {}) => {
    const fields = {
        chunkSize: configInfo?.chunkSize || 1000,
        chunkOverlap: configInfo?.chunkOverlap || 200,
        keepSeparator: configInfo?.keepSeparator || true,
        separators: configInfo?.separators || ["\n\n", "\n", ".", "!", "?", " ", ""]
    }
    return new RecursiveCharacterTextSplitter(fields);
}

exportData.embedderInstance = async () => {
    switch (process.env.EMBEDDER_TYPE) {

        case "google":
            return new GoogleGenerativeAIEmbeddings({
                // dimensions: 768, // Optional, defaults to 3,07 768, 1, 536
                modelName: process.env.EMBEDDING_MODEL || "gemini-embedding-001", // Optional, defaults to latest model
                // taskType: TaskType.RETRIEVAL_DOCUMENT,  // Optional, defaults to TaskType.RETRIEVAL_DOCUMENT. Specifies the type of task for which the embeddings will be used, which can help the model generate more relevant embeddings.
                // title: "Document title", // Optional, but can help improve embedding quality for certain models. If provided, it will be included in the metadata of the generated embedding.
                // stripNewLines: true, // Optional, defaults to false. Whether to remove newlines from the input text before generating embeddings.
            });
        case "default-embed":
            return new DefaultEmbeddingFunction({
                modelName: process.env.EMBEDDING_MODEL || "Xenova/all-MiniLM-L6-v2", // Default model
                revision: "main",
                dtype: "fp32", // or 'uint8' for quantization
                wasm: false, // Set to true to use WASM backend
            });
        default:
            throw new Error("Invalid EMBEDDER_TYPE specified in environment variables.");
    }
};

exportData.generativeAiInstance = async () => {
    switch (process.env.GENERATIVE_AI_TYPE) {
        case "GoogleGenAI":
            return new GoogleGenAI({});
        default:
            throw new Error("Unsupported generative AI type");
    }
};

exportData.PineconeUpsertVectors = async (chunkedDocs, embedder, vectorStore) => {
    if (!chunkedDocs || chunkedDocs.length === 0) {
        throw new Error("No documents provided for embedding.");
    }
    return await PineconeStore.fromDocuments(chunkedDocs, embedder, {
        pineconeIndex: vectorStore,
        maxConcurrency: 5,
    });
}

module.exports = exportData