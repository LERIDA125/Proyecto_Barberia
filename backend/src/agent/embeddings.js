const { HuggingFaceTransformersEmbeddings } = require('@langchain/community/embeddings/hf_transformers');

let instance = null;

function getEmbeddings() {
  if (!instance) {
    instance = new HuggingFaceTransformersEmbeddings({
      model: 'Xenova/all-MiniLM-L6-v2',
    });
  }
  return instance;
}

module.exports = { getEmbeddings };