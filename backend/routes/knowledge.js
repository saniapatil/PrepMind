import express from "express";
import { ingestDocument, retrieveRelevantChunks } from "../utils/embeddings.js";
import getOpenAIAPIResponse from "../utils/openai.js";
import Thread from "../models/Thread.js";
import KnowledgeChunk from "../models/KnowledgeChunk.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/chat", authMiddleware, async (req, res) => {
    const { threadId,message,topK = 3} = req.body;
    if (!threadId || !message) {
        return res.status(400).json({
            error: "threadId and message are required"
        });
    }
    try {
        const relevantChunks = [];
        let thread = await Thread.findOne({threadId,userId: req.user.userId});
        if (!thread) {
            thread = new Thread({userId: req.user.userId,threadId,title: message,messages: [
                    {
                        role: "user",
                        content: message
                    }]
            });
        } else {
            thread.messages.push({
                role: "user",
                content: message
            });
        }
        const assistantReply =
            await getOpenAIAPIResponse(message,relevantChunks);
            thread.messages.push({
            role: "assistant",
            content: assistantReply
        });
        thread.updatedAt = new Date();
        await thread.save();
        res.json({
            reply: assistantReply
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Something went wrong"
        });
    }
});

export default router;