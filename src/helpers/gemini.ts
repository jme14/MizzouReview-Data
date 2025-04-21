import { GoogleGenerativeAI, GenerateContentRequest } from "@google/generative-ai"
import { config } from 'dotenv';


//for use of general prompting from gemini
export async function generateAiInput(prompt: string){
    config();
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

export async function generateWikiFunFacts(articleText: string){
    const prompt = "You are an anthropologist focusing on education. This is a wikipedia page about a professor. Give me your top 5 most interesting facts about this professor, responding with a max of 5 words per fact, with only the facts in your response, in a silly tone like hashtags without pound signs. Here is the wikipedia page: " + articleText + "If there is no wikipedia page provided here, please respond with 'There is no Wikipedia page to pull from'";
    const generatedText = await generateAiInput(prompt);

    if (generatedText) {
        //console.log("Fun Facts Response: ", generatedText);
        return generatedText;
    }

}

export async function generateStudentLetter(allResponses: string[]){ //need to import from rmp.ts, but also need to see how we want to do it
    const prompt = "You are an inquisitive student having just read these reviews about the same professor being discussed in each review. Write a letter to other students, in 100 words or less, about what to expect from them, without including an opening or your name, using only them/them pronouns when referencing the professor: " + allResponses.join(". ") + "If there are no reviews listed here, please respond with 'There are not enough reviews available for letter creation'";
    const generatedText = await generateAiInput(prompt);

    if (generatedText) {
        //console.log("Letter To Students: ", generatedText);
        return generatedText;
    }
}

export async function generateProfessorLetter(allResponses: string[]){ //need to import from rmp.ts, but also need to see how we want to do it
    const prompt = "You are a successful professor having just read these reviews about a colleague. Write a letter to this professor, in 100 words or less, providing constructive criticism about this professor's teaching, without including an opening or your name: " + allResponses.join(". ") + "If there are no reviews listed here, please respond with 'There are not enough reviews available for letter creation'";
    const generatedText = await generateAiInput(prompt);

    if (generatedText) {
        //console.log("Letter To Professor: ", generatedText);
        return generatedText;
    }
}
