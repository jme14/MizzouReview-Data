
import {describe, expect, test} from "vitest"
import { Name } from "mizzoureview-reading"
import { BasicInfo } from "mizzoureview-reading"
import { getCourses } from "../src/mucourses"
import {updateFaculty} from "../src/main"
describe("onProfessorName", async () => {
    test("testing getting the professor objects", async () => {
        const professorArray = await updateFaculty()
        console.log(professorArray)
        expect(professorArray.success).toBeTruthy()
    })
})