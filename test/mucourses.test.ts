import {describe, expect, test} from "vitest"
import {someMiddleInitial, mucoursesData, getCourses, getCoursesByProfessor} from "../src/mucourses"

/*
describe("API access", () => {
    test("getCourses defined", async ()=> {
        const data = await getCourses()
        expect(data).toBeDefined()
    })

    test("getCourses consistent object subset test ", async () => {
        const data: Object[] = await getCourses()
        
        const keySet = new Set()
        Object.keys(data[0]).forEach((key) => keySet.add(key))
        
        const dataSubset = data.slice(0,100)
        dataSubset.forEach((datapoint: Object) => {
            Object.keys(datapoint).forEach((key) => {
                console.log(keySet)
                console.log(key)
                expect(keySet.has(key)).toBe(true)
            })
        })
        console.log(keySet)
    })
})
*/
describe("name regex", () => {
    test("Middle initial", () => {
        expect(someMiddleInitial("James", "Ries", "RIES,JAMES E")).toBe(true)
    })
    test("Middle name", () => {
        expect(someMiddleInitial("Jill", "Moreland", "Moreland,Jill Annette".toUpperCase())).toBe(true)
    })
})
describe("API result filtering", () => {
    test("getCourses by instructor name, known", async() => {
        const results: mucoursesData[] = await getCoursesByProfessor("Jill", "Moreland", "Annette")
        expect(results.length).toBeGreaterThan(0)
        //console.log(results)
    })

    test("getCourses by instructor name, middle initial unknown", async() => {
        const results: mucoursesData[] = await getCoursesByProfessor("James", "Ries")
        expect(results.length).toBeGreaterThan(0)
        expect(results.length).toBeLessThan(1000)
        console.log(results)
    })
    test("getCourses by instructor name, middle name unknown", async() => {
        const jillResults: mucoursesData[] = await getCoursesByProfessor("Jill", "Moreland")
        expect(jillResults.length).toBeGreaterThan(0)
        expect(jillResults.length).toBeLessThan(1000)

        //const jurczykResults: mucoursesData[] = await getCoursesByProfessor("Michael", "Jurczyk")

        const mckenzieResults: mucoursesData[] = await getCoursesByProfessor("Gary", "McKenzie")
        expect(mckenzieResults.length).toBeGreaterThan(0)
        expect(mckenzieResults.length).toBeLessThan(1000)
        console.log(mckenzieResults)


    })
})