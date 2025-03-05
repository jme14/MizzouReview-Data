// this is for testing the complete process of looking professors up,
// searching the relevent fields, and populating their information

import { getProfessorNames } from './mucatalog';
import { getCoursesByProfessor } from './mucourses';
import { getArticleContentByName } from './wikipedia';

import { BasicInfo, ObjectiveMetrics, Professor } from './models/professor';
import { Name } from './models/name';
import { getCourses } from './mucourses';
import { mucoursesData } from './mucourses';

console.log(process.env.NODE_ENV)
async function main() {
    // get professor names
    let allProfessorNames = await getProfessorNames();
    // if testing, make names a subset
    if (process.env.NODE_ENV == "development") {
        allProfessorNames = allProfessorNames.slice(0, 20);
    }

    // apply name analysis
    allProfessorNames.map(onProfessorName);

}

export async function onProfessorName(name: Name): Promise<Professor> {

    // TODO these things 
    // check if professor exists
    // if exists, get professor record and update
    // if not exists, make professor id and new professor object

    // get mucourses data
    const allCourses = await getCourses()
    if (!allCourses){
        throw new Error("Error with getCourses()")
    }
    const courses = getCoursesByProfessor(name, allCourses)
    const totalCourses = courses.length

    const totalGPA = courses.reduce((sum: number, course:mucoursesData) => {
        console.log(course.average)
        return sum+course.average
    }, 0)
    const averageGPA = Math.round((totalGPA/totalCourses)*100)/100


    const basicInfo = new BasicInfo(name , "CS")
    const objectiveMetrics = new ObjectiveMetrics(averageGPA, 0)

    // make professor object (needs changing when database module complete)
    return new Professor("testing", {basicInfo, objectiveMetrics})
}
