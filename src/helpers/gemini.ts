import { GoogleGenerativeAI, GenerateContentRequest } from "@google/generative-ai"
import * as dotenv from 'dotenv';
//import { getArticleContentByName } from './wikipedia';
//import { }
dotenv.config();


//for use of general prompting from gemini
async function generateAiInput(prompt: string){

    const apiKey = process.env.GEMINI_API_KEY;

    if(!apiKey){
        throw new Error("API key for Gemini is not set up correctly in environment");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

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

//this is just to test that it works; delete later IT WORKS!!!!!!!!
/*async function main() {
    const prompt = "Write a short poem about the moon.";
    const generatedText = await generateAiInput(prompt);
  
    if (generatedText) {
      console.log("Generated text:", generatedText);
    }
  }
  
  main();*/

async function generateWikiFunFacts(articleText: string){
    const prompt = "You are an anthropologist focusing on education. This is a wikipedia page about a professor. Give me your top 5 most interesting facts about this professor, responding with a max of 5 words per fact, with only the facts in your response, in a silly tone like hashtags without pound signs. Here is the wikipedia page: " + articleText;
    const generatedText = await generateAiInput(prompt);

    if (generatedText) {
        console.log("Fun Facts Response:", generatedText);
    }

}

//async function generateStudentLetter(allResponses: RatingData[]){ //need to import from rmp.ts, but also need to see how we want to do it

//}
