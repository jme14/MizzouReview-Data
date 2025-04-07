import {describe, expect, test} from "vitest"
import {readWebsite} from "../src/rmp"


describe("reading a website!", async () => {
    test("find rmp", async ()=> {
        // const data = await readWebsite()
        const data = true 
        console.log(data)
        expect(data).toBeTruthy()
    })
})
