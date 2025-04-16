import { GoogleGenerativeAI, GenerateContentRequest } from "@google/generative-ai"
import * as dotenv from 'dotenv';
//import { getArticleContentByName } from './wikipedia';
dotenv.config();


//for use of general prompting from gemini
async function generateAiInput(prompt: string){

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash "});

    const request: GenerateContentRequest = {
        contents: [{ role: "user", parts: [{ text: prompt}] }],
    };

    try{
        const response = await model.generateContent(request);
        const text = response.response.text();
        return text;
    } catch (error: any) {
        console.error("Couldn't generate result correctly: ", error.message);
        return null;
    }
}

async function generateWikiFunFacts(articleText: string){

}
