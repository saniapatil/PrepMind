import KnowledgeChunk from "../models/KnowledgeChunk.js";
 
const OLLAMA_URL = process.env.OLLAMA_URL;
const EMBED_MODEL = "nomic-embed-text"; 
 
/**
 * 
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export async function generateEmbedding(text) {
    const response = await fetch(`${OLLAMA_URL}/api/embeddings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: EMBED_MODEL, prompt: text }),
    });
 
    if (!response.ok) {
        throw new Error(`Ollama embedding failed: ${response.statusText}`);
    }
 
    const data = await response.json();
    return data.embedding; 
}
 
/**
 * 
 * @param {string} text
 * @param {number} chunkSize   
 * @param {number} overlap     
 * @returns {string[]}
 */
export function chunkText(text, chunkSize = 500, overlap = 100) {
    const chunks = [];
    let start = 0;
 
    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);
        chunks.push(text.slice(start, end).trim());
        start += chunkSize - overlap;
    }
 
    return chunks.filter((c) => c.length > 0);
}
 
/**
 * 
 * @param {string} text    
 * @param {string} source   
 */
export async function ingestDocument(text, source = "manual") {
    const chunks = chunkText(text);
    const saved = [];
 
    for (const chunk of chunks) {
        const embedding = await generateEmbedding(chunk);
        const doc = new KnowledgeChunk({ content: chunk, embedding, source });
        await doc.save();
        saved.push(doc._id);
    }
 
    return { chunksStored: saved.length };
}
 
/*** 
 *
 * @param {string} query
 * @param {number} topK
 * @returns {Promise<string[]>}  
 */
export async function retrieveRelevantChunks(query, topK = 3) {
    const queryEmbedding = await generateEmbedding(query);
 
    const allChunks = await KnowledgeChunk.find({}, "content embedding");
 
    const scored = allChunks.map((chunk) => ({
        content: chunk.content,
        score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }));
 
    scored.sort((a, b) => b.score - a.score);
    const THRESHOLD = 0.5;
    return scored.slice(0, topK).filter(c => c.score >= THRESHOLD).map(c => c.content);
}
 
function cosineSimilarity(a, b) {
    if (a.length !== b.length) return 0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-8);
}
 