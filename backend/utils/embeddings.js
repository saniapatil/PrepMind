import KnowledgeChunk from "../models/KnowledgeChunk.js";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function generateEmbedding(text) {
    const response = await fetch("https://api.groq.com/openai/v1/embeddings", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: "nomic-embed-text-v1_5",
            input: text
        }),
    });
    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Groq embedding failed: ${err}`);
    }
    const data = await response.json();
    return data.data[0].embedding;
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