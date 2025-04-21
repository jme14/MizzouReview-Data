import { describe, expect, test } from 'vitest';
import { generateWikiFunFacts } from '../src/helpers/gemini';
import { generateStudentLetter } from '../src/helpers/gemini';
import { generateProfessorLetter , generateAiInput} from '../src/helpers/gemini';
import {AIPromptAnswers} from "mizzoureview-reading/models/professor"

describe("testing api calll", () => {
    const prompt = "Write a short song about computer science."

    test("this should make a nice song", async () => {
        const generatedText = await generateAiInput(prompt);
  
        if (generatedText) {
          console.log("Generated text:", generatedText);
        }

        expect(generatedText).toBeTruthy()
    })
})
describe ('Checking Wikipedia Fun Facts', () => {
    const apiKey = process.env.GEMINI_API_KEY;
    const goodFakeArticle = "Jeffrey K. Uhlmann is an American research scientist who is probably best known for his mathematical generalizations of the Kalman filter.[1] Most of his publications and patents have been in the field of data fusion. He is also known for being a cult filmmaker and former recording artist. Dr. Uhlmann is ranked in the top 2% among scientists worldwide in the Stanford University listing of most-cited researchers.[2] Biography Uhlmann has degrees in philosophy, computer science, and a doctorate in robotics from the University of Oxford.[3][4] He began work in 1987 at NRL's Laboratory for Computational Physics and Fluid Dynamics in Washington, DC, and remained at NRL until 2000. Since 2000 he has been a professor of computer science at the University of Missouri.[5] He served for ten years as a co-founding member of the editorial board of the ACM Journal of Experimental Algorithmics (1995–2006) before becoming co-editor of the Synthesis Lectures on Quantum Computing series for Morgan & Claypool.[6] Theoretical Research Uhlmann published seminal papers on volumetric, spatial, and metric tree data structures and their applications for computer graphics, virtual reality, and multiple-target tracking.[7][8][9] He originated the unscented transform (and its use in the unscented Kalman filter) and the data fusion techniques of covariance intersection and covariance union.[1][3] His work in artificial intelligence has recently focused on tensor-completion methods for recommender system applications.[10] Applied Results Uhlmann's results are widely-applied in tracking, navigation, and control systems, including for the NASA Mars rover program.[11][12] His results relating to the constrained shortest path problem and simultaneous localization and mapping are also used in rover and autonomous vehicle applications.[13][14] Films Uhlmann has written, directed, produced, and/or acted in several prominent short and feature-length films. Notable examples include the animated short film Susan's Big Day[15] and the feature films Mil Mascaras vs. the Aztec Mummy, Academy of Doom, and Aztec Revenge. In recent years he has been a popular invited guest at international genre film festivals.[16] Music Uhlmann recorded and released a series of albums in the 1970s and 1980s. Some of his early experimental electronic albums have been reissued in their entirety on CD[17] or digital download[18] while his arguably better-known songs are only available on CD compilations.[19]"
    const badFakeArticle = ""
    let funFactsGood: string[] | undefined
    test('Does it work for someone with a valid wikipedia page?', async () => {
        const funFacts = await generateWikiFunFacts(goodFakeArticle);
        expect(funFacts).toBeDefined();

        funFactsGood = funFacts
    });

    test('Does it work for someone without a valid wikipedia page?', async () => {
        const apiKey = process.env.GEMINI_API_KEY;
        const funFacts = await generateWikiFunFacts(badFakeArticle);
        expect(funFacts).toBeDefined();
        console.log(funFacts);
    });
    test("Do the fun facts conform to the prompt?", () => {
        if (funFactsGood === undefined){
            throw new Error("facts undefined")
        }
        expect(funFactsGood.length).toBe(5) 
        const AIResult = new AIPromptAnswers({funFacts: funFactsGood})
        expect(AIResult).toBeTruthy()
        expect(AIResult.funFacts).toBeTruthy()
        console.log(AIResult)
    })

});

describe ('Checking Letter to Student', () => {
    const apiKey = process.env.GEMINI_API_KEY;
    const goodReviews = ["Prof. Gary is pretty nice and flexible with students. I really appreciate how he ran both Capstone classes in that he gave us class time back to us to work on our projects. He was available outside of class time to help my group test our project and was able to answer all of our questions. Couldn't have asked for a better professor for this class.", "Professor McKenzie is funny and really cares about students. I feel like his feedback and grading is very thorough and always well-thought-out. He is very accessible outside of class and I liked how he adjusted due dates and is in general a flexible person. I always liked how he ended class early and didn't have class when we had group meetings.", "Great teacher, gets concepts across well. Very available outside of class."]
    const badReviews = [" "]
    
    test('Does the student letter work for a professor with rmp reviews?', async () => {
        const studentLetter = await generateStudentLetter(goodReviews);
        expect(studentLetter).toBeDefined;
        console.log(studentLetter);
    });

    test('Does the student letter work for a professor with no rmp reviews?', async () => {
        const studentLetter1 = await generateStudentLetter(badReviews);
        expect(studentLetter1).toBeDefined;
        console.log(studentLetter1);
    });

});

describe ('Checking Letter to Professor', () => {
    const apiKey = process.env.GEMINI_API_KEY;
    const goodReviews = ["Prof. Gary is pretty nice and flexible with students. I really appreciate how he ran both Capstone classes in that he gave us class time back to us to work on our projects. He was available outside of class time to help my group test our project and was able to answer all of our questions. Couldn't have asked for a better professor for this class.", "Professor McKenzie is funny and really cares about students. I feel like his feedback and grading is very thorough and always well-thought-out. He is very accessible outside of class and I liked how he adjusted due dates and is in general a flexible person. I always liked how he ended class early and didn't have class when we had group meetings.", "Great teacher, gets concepts across well. Very available outside of class."]
    const badReviews = [" "]

    test('Does the professor letter work for a professor with rmp reviews?', async () => {
        const professorLetter = await generateProfessorLetter(goodReviews);
        expect(professorLetter).toBeDefined;
        console.log(professorLetter);
    });

    test('Does the professor letter work for a professor with no rmp reviews?', async () => {
        const professorLetter1 = await generateProfessorLetter(badReviews);
        expect(professorLetter1).toBeDefined;
        console.log(professorLetter1);
    });
});