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

import { getProfessorBasicInfo } from './mucatalog';
import { getCoursesByProfessor } from './mucourses';
import { getArticleContentByName } from './wikipedia';

import {
    BasicInfo,
    ObjectiveMetrics,
    Professor,
    SubjectiveMetrics,
    AIPromptAnswers,
    Name,
    getAllProfessors,
} from 'mizzoureview-reading';

import { getCourses } from './mucourses';
import { mucoursesData } from './mucourses';
import { initializeProfessor, updateProfessor } from './database';

import { writeProfessors } from './database';

const firebaseConfig = {
    credential: cert(require('../keys/admin.json')),
};

const TESTING = true
// below function from chatgpt with minor edits
function generateProfessorId(
    basicInfo: BasicInfo,
    length: number = 20,
): string {
    const input = basicInfo.name.toString() + basicInfo.department;
    // Simple hash function to turn the string into a number seed
    let seed = 0;
    for (let i = 0; i < input.length; i++) {
        seed = (seed * 31 + input.charCodeAt(i)) >>> 0; // ensure unsigned int
    }

    // Pseudo-random number generator using Mulberry32 (fast and decent)
    function mulberry32(a: number) {
        return function () {
            a |= 0;
            a = (a + 0x6d2b79f5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    const rand = mulberry32(seed);
    const chars =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const index = Math.floor(rand() * chars.length);
        result += chars[index];
    }

    return result;
}

export async function updateFaculty() {
    // getting database information
    const app = initializeApp(firebaseConfig);
    const db: Firestore = getFirestore(app);

    // const allDatabaseProfessors = await getAllProfessors(db)
    let professorBasicInfo = await getProfessorBasicInfo();
    const professorArray: Professor[] = []
    professorBasicInfo.forEach((basicInfo) => {
        const newProf = new Professor(generateProfessorId(basicInfo), { basicInfo: basicInfo });
        professorArray.push(newProf)
    });

    // if testing, make this smaller
    if (TESTING){
        professorBasicInfo = professorBasicInfo.slice(0,1000)
    }

    return await writeProfessors(db, professorArray)
}

// mainWithDatabase()
// program flow including the database, updating records on matches
/*
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
*/
