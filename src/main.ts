// this is for testing the complete process of looking professors up,
// searching the relevent fields, and populating their information
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import {
    getFirestore,
    Firestore,
    Timestamp,
    FieldValue,
    Filter,
    CollectionReference,
    DocumentReference,
} from 'firebase-admin/firestore';

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
import { getAllProfessors } from './database';

const firebaseConfig = {
    credential: cert(require('../keys/admin.json')),
};


extractProfessorData();

// program flow including the database, updating records on matches 
async function mainWithDatabase(){

    // getting database information 
    const app = initializeApp(firebaseConfig);
    const db: Firestore = getFirestore(app);

    // TODO: run these at the same time 
    const allDatabaseProfessors = await getAllProfessors(db)
    const allProfessorObjects = await extractProfessorData()

}
// program flow for getting professor data 
async function extractProfessorData(): Promise<Professor[]> {
    console.log(process.argv.slice(2));

    // get professor names from mu catalog 
    let allProfessorNames = await getProfessorNames();

    // if testing, make names a subset
    if ( process.argv.slice(2)[0] == 'testing') {
        allProfessorNames = allProfessorNames.slice(0, 20);
    }

    // get mucourses data
    const allCourses = await getCourses();
    if (!allCourses) {
        throw new Error('Error with getCourses()');
    }

    const allProfessorPromises = allProfessorNames.map(
        async (name) => await onProfessorName(name, allCourses),
    );
    return Promise.all(allProfessorPromises) 
}

// the data analysis based on the professor name
export async function onProfessorName(name: Name, allCourses: mucoursesData[]): Promise<Professor> {
    // TODO these things
    // check if professor exists
    // if exists, get professor record and update
    // if not exists, make professor id and new professor object

    const courses = getCoursesByProfessor(name, allCourses);
    const totalCourses = courses.length;

    let totalGPA = 0
    let averageGPA = 0
    if (totalCourses > 0){
        totalGPA = courses.reduce((sum: number, course: mucoursesData) => {
            console.log(course.average);
            return sum + course.average;
        }, 0);
        averageGPA = Math.round((totalGPA / totalCourses) * 100) / 100;
    }

    let articleContent = await getArticleContentByName(name);
    if (articleContent != 'No article') {
        articleContent = 'Article!';
    }

    const basicInfo = new BasicInfo(name, 'NEEDS COMPLETION');
    const objectiveMetrics = new ObjectiveMetrics(averageGPA, 0);
    const funFacts = new AIPromptAnswers({ funFacts: articleContent });

    // make professor object (needs changing when database module complete)
    return new Professor('testing', {
        basicInfo: basicInfo,
        objectiveMetrics: objectiveMetrics,
        aIPromptAnswers: funFacts,
    });
}
