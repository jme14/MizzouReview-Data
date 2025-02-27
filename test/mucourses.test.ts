import {describe, expect, test} from "vitest"
import {mucoursesData, getCourses, getCoursesByProfessor} from "../src/mucourses"
import { Name } from "../src/models/name"

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
describe("API result filtering", async () => {
    const allCourses = await getCourses()
    test("getCourses by instructor name, known", async() => {
        const name = new Name("Jill", "Moreland", ["Annette"])
        const results: mucoursesData[] = getCoursesByProfessor(name, allCourses)
        expect(results.length).toBeGreaterThan(0)
        //console.log(results)
    })

    /*
    test("getCourses by instructor name, middle initial unknown", async() => {
        const name = new Name("James", "Ries")
        const results: mucoursesData[] = getCoursesByProfessor(name, allCourses)
        expect(results.length).toBeGreaterThan(0)
        expect(results.length).toBeLessThan(1000)
        console.log(results)
    })
    test("getCourses by instructor name, middle name unknown", async() => {
        const jillName = new Name("Jill", "Moreland")
        const jillResults: mucoursesData[] = getCoursesByProfessor(jillName, allCourses)
        expect(jillResults.length).toBeGreaterThan(0)
        expect(jillResults.length).toBeLessThan(1000)

        const mckenzieName = new Name("Gary", "McKenzie")
        const mckenzieResults: mucoursesData[] = getCoursesByProfessor(mckenzieName, allCourses)
        expect(mckenzieResults.length).toBeGreaterThan(0)
        expect(mckenzieResults.length).toBeLessThan(1000)


    })
    */
})