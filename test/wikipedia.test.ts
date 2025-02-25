
import {describe, expect, test} from "vitest"
import {getArticleContentByName} from "../src/wikipedia"

describe("Checking api call works", () => {
    test("Does it return something interesting for someone that has a wikipedia article", async () => {
        const articleText = await getArticleContentByName("Jeffrey", "Uhlmann")
        expect(articleText).toBeDefined()
    })

    test("Does it return nothing if there's no valid article", async () => {
        const articleText = await getArticleContentByName("Jim", "Ries")
        expect(articleText).toBeDefined()
        expect(articleText).toBe("No article")
    })
})