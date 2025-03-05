// this is for testing the complete process of looking professors up,
// searching the relevent fields, and populating their information

import { getProfessorNames } from './mucatalog';
import { getCoursesByProfessor } from './mucourses';
import { getArticleContentByName } from './wikipedia';

import {
    BasicInfo,
    ObjectiveMetrics,
    Professor,
    SubjectiveMetrics,
    AIPromptAnswers,
} from './models/professor';
import { Name } from './models/name';
import { getCourses } from './mucourses';
import { mucoursesData } from './mucourses';

main();
async function main() {
    console.log(process.argv.slice(2));
    // get professor names
    let allProfessorNames = await getProfessorNames();
    // if testing, make names a subset
    if ( process.argv.slice(2)[0] == 'testing') {
        allProfessorNames = allProfessorNames.slice(0, 20);
    }

    const allProfessors = allProfessorNames.map(
        async (name) => await onProfessorName(name),
    );
    allProfessors.forEach((prof) => console.log(prof));
}

// the data analysis based on the professor name
export async function onProfessorName(name: Name): Promise<Professor> {
    // TODO these things
    // check if professor exists
    // if exists, get professor record and update
    // if not exists, make professor id and new professor object

    // get mucourses data
    const allCourses = await getCourses();
    if (!allCourses) {
        throw new Error('Error with getCourses()');
    }
    const courses = getCoursesByProfessor(name, allCourses);
    const totalCourses = courses.length;

    const totalGPA = courses.reduce((sum: number, course: mucoursesData) => {
        console.log(course.average);
        return sum + course.average;
    }, 0);
    const averageGPA = Math.round((totalGPA / totalCourses) * 100) / 100;

    let articleContent = await getArticleContentByName(name);
    if (articleContent != 'No Article') {
        articleContent = 'Article!';
    }

    const basicInfo = new BasicInfo(name, 'CS');
    const objectiveMetrics = new ObjectiveMetrics(averageGPA, 0);
    const funFacts = new AIPromptAnswers({ funFacts: articleContent });

    // make professor object (needs changing when database module complete)
    return new Professor('testing', {
        basicInfo: basicInfo,
        objectiveMetrics: objectiveMetrics,
        aIPromptAnswers: funFacts,
    });
}
