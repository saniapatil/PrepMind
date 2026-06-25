import dotenv from "dotenv";
dotenv.config();
const getOpenAIAPIResponse = async (message, contextChunks = []) => {
 
    const systemContent = `You are PrepMind, an interview prep assistant.
Answer the user's question using ONLY the context provided below.
If the context does not contain a clear answer, say "I don't have enough information on that topic in my knowledge base."
Do not make up information. Do not use outside knowledge.
 
Context:
${contextChunks.map((chunk, i) => `[${i + 1}] ${chunk}`).join("\n\n")}`;
 
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemContent }, 
                { role: "user",   content: message }
            ]
        }),
    };
 
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", options);
        const data = await response.json();
        return data.choices[0].message.content;
    } catch(err) {
        console.log(err);
        throw err;
    }
}
 
export default getOpenAIAPIResponse;