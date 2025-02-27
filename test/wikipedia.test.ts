
import {describe, expect, test} from "vitest"
import {getArticleContentByName} from "../src/wikipedia"
import { Name } from "../src/models/name"
describe("Checking api call works", () => {
    test("Does it return something interesting for someone that has a wikipedia article", async () => {
        const jeff = new Name("Jeffrey", "Uhlmann")
        const articleText = await getArticleContentByName(jeff)
        expect(articleText).toBeDefined()
    })

    test("Does it return nothing if there's no valid article", async () => {
        const jim = new Name("Jim", "Ries")
        const articleText = await getArticleContentByName(jim)
        expect(articleText).toBeDefined()
        expect(articleText).toBe("No article")
    })
})