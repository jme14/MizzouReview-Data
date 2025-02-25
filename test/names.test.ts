import {describe, expect, test} from "vitest"
import { someMiddleInitial, someMiddleName } from "../src/names"

describe("name regex", () => {
    test("Middle initial", () => {
        expect(someMiddleInitial("James", "Ries", "RIES,JAMES E")).toBe(true)
    })
    test("Middle name", () => {
        expect(someMiddleName("Jill", "Moreland", "Moreland,Jill Annette".toUpperCase())).toBe(true)
    })
})