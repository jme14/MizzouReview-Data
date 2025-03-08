import {describe, expect, test} from "vitest"
import {readWebsite} from "../src/rmp"


describe("reading a website!", () => {
    test("find rmp", async ()=> {
        const data = await readWebsite()
        expect(data).toBeTruthy()
    })
})
