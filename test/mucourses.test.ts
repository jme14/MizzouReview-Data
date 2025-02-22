import {expect, test} from "vitest"
import {getCourses} from "../src/mucourses"

test("getCourses", async ()=> {
    const data = await getCourses()
    console.log(data)
})