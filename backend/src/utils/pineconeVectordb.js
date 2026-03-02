const { Pinecone } = require('@pinecone-database/pinecone');

const exportData = {};

exportData.pineconeIndex = async () => {
    const pinecone = new Pinecone();
    return pinecone.Index(process.env.PINECONE_INDEX_NAME);
}

module.exports = exportData