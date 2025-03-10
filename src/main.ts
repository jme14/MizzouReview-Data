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

import { getProfessorBasicInfo } from './mucatalog'
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
import { initializeProfessor, updateProfessor } from './database';
import { readWebsite } from './rmp';
const firebaseConfig = {
    credential: cert(require('../keys/admin.json')),
};

readWebsite()
// mainWithDatabase()
// program flow including the database, updating records on matches 
async function mainWithDatabase(){

    // getting database information 
    const app = initializeApp(firebaseConfig);
    const db: Firestore = getFirestore(app);

    // TODO: run these at the same time 
    const allDatabaseProfessors = await getAllProfessors(db)
    const allProfessorObjects = await extractProfessorData()

    const pInDB: Professor[] = []
    const pNotInDB: Professor[] = []

    // this creates two arrays based off if the professor is already in the database 
    const [professorsInDatabase, professorsNotInDatabase] = allProfessorObjects.reduce((profs, prof) => {
        // this returns true on prof existing in array and false on not  
        const inDatabase = allDatabaseProfessors.some((dbProf) => {
            if (!dbProf.basicInfo || !prof.basicInfo){
                return false
            } 
            return dbProf.basicInfo.name == prof.basicInfo.name
        })
        // this pushes to first array if it's in database and second array if it isn't in the database 
        profs[inDatabase ? 0 : 1].push(prof)
        return profs
    }, [pInDB, pNotInDB])

    professorsNotInDatabase.forEach((prof) => initializeProfessor(db, prof))
    professorsInDatabase.forEach(((prof) => updateProfessor(db, prof)))
    console.log("Done?")
    return true 
}
// program flow for getting professor data 
async function extractProfessorData(): Promise<Professor[]> {
    console.log(process.argv.slice(2));

    // get professor names from mu catalog 
    let allProfessorBasicInfo = await getProfessorBasicInfo();

    // if testing, make names a subset
    if ( process.argv.slice(2)[0] == 'testing') {
        allProfessorBasicInfo = allProfessorBasicInfo.slice(0, 20);
    }

    // get mucourses data
    const allCourses = await getCourses();
    if (!allCourses) {
        throw new Error('Error with getCourses()');
    }

    const allProfessorPromises = allProfessorBasicInfo.map(
        async (name) => await onProfessorBasicInfo(name, allCourses),
    );
    return Promise.all(allProfessorPromises) 
}

// the data analysis based on the professor name
export async function onProfessorBasicInfo(basicInfo: BasicInfo, allCourses: mucoursesData[]): Promise<Professor> {
    // TODO these things
    // check if professor exists
    // if exists, get professor record and update
    // if not exists, make professor id and new professor object

    const courses = getCoursesByProfessor(basicInfo.name, allCourses);
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

    let articleContent = await getArticleContentByName(basicInfo.name);
    if (articleContent != 'No article') {
        articleContent = 'Article!';
    }

    const objectiveMetrics = new ObjectiveMetrics(averageGPA, 0);
    const funFacts = new AIPromptAnswers({ funFacts: articleContent });

    // make professor object (needs changing when database module complete)
    return new Professor(basicInfo.toString(), {
        basicInfo: basicInfo,
        objectiveMetrics: objectiveMetrics,
        aIPromptAnswers: funFacts,
    });
}
