import mongoose from "mongoose";
 
const KnowledgeChunkSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    embedding: {
        type: [Number],   
        required: true,
    },
    source: {
        type: String,
        default: "manual", 
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
 
 
export default mongoose.model("KnowledgeChunk", KnowledgeChunkSchema);