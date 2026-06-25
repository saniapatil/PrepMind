import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import chatRoutes from "./routes/chat.js";
import knowledgeRouter from "./routes/knowledge.js";
import authRouter from "./routes/auth.js";

const app = express();
const port = 8080;

app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));
app.use("/api", chatRoutes);
app.use("/api/knowledge", knowledgeRouter);
app.use("/api/auth", authRouter);

app.listen(port, () => {
    console.log(`server running on ${port}`);
});

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("connected with database");
    } catch(err) {
        console.log("failed to connect with Db", err);
    }
};
connectDB();
