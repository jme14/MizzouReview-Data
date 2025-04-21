import { describe, expect, test } from 'vitest';
import { getArticleContentByName, setProfessorFunFacts } from '../src/collection/wikipedia';
import { Name } from 'mizzoureview-reading/models/name';
import {initializeDatabase} from "../src/database/initializer"
import {getProfessorsFromName} from "mizzoureview-reading/database-admin"

describe('Checking api call works', () => {
    test('Does it return something interesting for someone that has a wikipedia article', async () => {
        const jeff = new Name('Jeffrey', 'Uhlmann');
        const articleText = await getArticleContentByName(jeff);
        console.log(articleText)
        expect(articleText).toBeDefined();
    });

    test("Does it return nothing if there's no valid article", async () => {
        const jim = new Name('Jim', 'Ries');
        const articleText = await getArticleContentByName(jim);
        expect(articleText).toBeDefined();
        expect(articleText).toBe('No article');
    });
});

describe ("integration with AI", () => {
    test("Jeffrey Uhlman all together", async () => {
        const db = initializeDatabase()
        const jeff = await getProfessorsFromName(db, "Jeffrey", "Uhlmann")
        const myJeff = jeff[0]
        if (myJeff=== undefined){
            throw new Error("Name undefined")
        }

        const success = await setProfessorFunFacts([myJeff])
        expect(success).toBeTruthy()

        if (myJeff.aIPromptAnswers === undefined){
            throw new Error("AI Prompt assigning failure")
        }
        expect(myJeff.aIPromptAnswers.funFacts).toBeTruthy()
        console.log(myJeff.aIPromptAnswers.funFacts)
    })
})