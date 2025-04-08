import {beforeAll, describe, expect, test} from "vitest"
import {getPage, fillProfName} from "../src/rmp"
import {Page} from "playwright"


describe("reading a website!", async () => {
    let page: Page

    beforeAll(async () =>{
        page = await getPage()
    })

    test("get page", async ()=> {
        expect(page).toBeTruthy()
    })
})
