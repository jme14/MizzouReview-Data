import {describe, expect, test} from "vitest"
import {mucoursesData, getCourses, getCoursesByProfessor} from "../src/mucourses"

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
describe("API result filtering", () => {
    test("getCourses by instructor name, known", async() => {
        const results: mucoursesData[] = await getCoursesByProfessor("Jill", "Moreland", "Annette")
        expect(results.length).toBeGreaterThan(0)
        console.log(results)
    })

    test("getCourses by instructor name, unknown", async() => {
        const results: mucoursesData[] = await getCoursesByProfessor("Ries", "James")
        expect(results.length).toBeGreaterThan(0)
        console.log(results)

    })
})