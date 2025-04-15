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
import { getCoursesByProfessor, setProfessorObjectiveMetrics } from './mucourses';
import { getArticleContentByName } from './wikipedia';

import {
    BasicInfo,
    ObjectiveMetrics,
    Professor,
    SubjectiveMetrics,
    AIPromptAnswers,
    Name,
    getAllProfessors,
    getSomeProfessors
} from 'mizzoureview-reading';

import { getCourses } from './mucourses';
import { mucoursesData } from './mucourses';
import { initializeProfessor, updateProfessor } from './database';

import { writeProfessors } from './database';
import { TESTING, PROF_READ_LIMIT } from "../keys/config.json"

const firebaseConfig = {
    credential: cert(require('../keys/admin.json')),
};

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

// this scrapes mufaculty to get the information which creates professor objects 
export async function createProfessorsFromCatalog(): Promise<Professor[]>{
    let professorBasicInfo = await getProfessorBasicInfo();
    const professorArray: Professor[] = []
    professorBasicInfo.forEach((basicInfo) => {
        const newProf = new Professor(generateProfessorId(basicInfo), { basicInfo: basicInfo });
        professorArray.push(newProf)
    });
    return professorArray
}

// this function scrapes mucatalog, then puts the data in the database
export async function updateMUCatalog() {
    // getting database information
    const app = initializeApp(firebaseConfig);
    const db: Firestore = getFirestore(app);

    const professorArray = await createProfessorsFromCatalog()
    return await writeProfessors(db, professorArray)
}

// this function accesses data from mucatalog, then puts data in the database 
export async function updateMUCourses() {
    // getting database information
    const app = initializeApp(firebaseConfig);
    const db: Firestore = getFirestore(app);

    const professorArray = TESTING ? await getSomeProfessors(db, PROF_READ_LIMIT) : await getAllProfessors(db)
    const updatedProfessorArray = await setProfessorObjectiveMetrics(professorArray)
    return updatedProfessorArray
}