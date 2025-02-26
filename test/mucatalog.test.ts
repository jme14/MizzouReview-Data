
import {describe, expect, test} from "vitest"
import {getProfessorNames} from "../src/mucatalog"

describe("getProfessorNames", async () => {
    test("Do I get a list of names?", async () => {
        const result = await getProfessorNames()
        expect(result.length).toBeGreaterThan(0)
    })

})