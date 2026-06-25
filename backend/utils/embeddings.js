import KnowledgeChunk from "../models/KnowledgeChunk.js";

const HF_API_KEY = process.env.HF_API_KEY;
const EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2";

export async function generateEmbedding(text) {
    const response = await fetch(
        `https://api-inference.huggingface.co/pipeline/feature-extraction/${EMBED_MODEL}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${HF_API_KEY}`
            },
            body: JSON.stringify({ inputs: text, options: { wait_for_model: true } }),
        }
    );

    if (!response.ok) {
        throw new Error(`HuggingFace embedding failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
}

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

export async function retrieveRelevantChunks(query, topK = 3) {
    const queryEmbedding = await generateEmbedding(query);
    const allChunks = await KnowledgeChunk.find({}, "content embedding");
    const scored = allChunks.map((chunk) => ({
        content: chunk.content,
        score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }));
    scored.sort((a, b) => b.score - a.score);
    const THRESHOLD = 0.3;
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