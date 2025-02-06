import {expect, test} from "vitest"
import { Firestore } from "firebase-admin/firestore";
import { writeProfessor } from "../src/database";
import {Professor} from "../src/models/professor"

test("writeProfessor", ()=> {
    const badDB = new Firestore()
    const professor = new Professor("jimr")
    writeProfessor(badDB, professor)
})
test("writeProfessor -- Overwriting via optional paramters", ()=> {
    expect(false).toBe(true)
})