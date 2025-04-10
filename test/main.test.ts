
import {describe, expect, test} from "vitest"
import { Name } from "mizzoureview-reading"
import { BasicInfo } from "mizzoureview-reading"
import { onProfessorBasicInfo} from "../src/main"
import { getCourses } from "../src/mucourses"
describe("onProfessorName", async () => {
    test("Using my main man JimR", async () => {
        const jimr = new Name("James", "Ries")
        const allCourses = await getCourses()
        const jimrInfo = new BasicInfo(jimr, "NEEDS IMPROVEMENT")
        const jimrProfessor = await onProfessorBasicInfo(jimrInfo, allCourses)
        console.log(jimrProfessor)
        expect(jimrProfessor).toBeTruthy()
        expect(jimrProfessor.objectiveMetrics?.gpa).toBeTruthy()
    })
})