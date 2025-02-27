
import {describe, expect, test} from "vitest"
import { Name } from "../src/models/name"
import { onProfessorName } from "../src/main"

describe("onProfessorName", async () => {
    test("Using my main man JimR", async () => {
        const jimr = new Name("James", "Ries")
        const jimrProfessor = await onProfessorName(jimr)
        console.log(jimrProfessor)
        expect(jimrProfessor).toBeTruthy()
        expect(jimrProfessor.objectiveMetrics?.gpa).toBeTruthy()
    })
})