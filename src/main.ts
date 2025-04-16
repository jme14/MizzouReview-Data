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
import {
    getCoursesByProfessor,
    setProfessorObjectiveMetrics,
} from './mucourses';
import { getArticleContentByName } from './wikipedia';

import {
    BasicInfo,
    ObjectiveMetrics,
    Professor,
    SubjectiveMetrics,
    AIPromptAnswers,
    Name,
    getAllProfessors,
    getSomeProfessors,
} from 'mizzoureview-reading';

import { generateProfessorId } from './professorId';
// import { getCourses } from './mucourses';
import { mucoursesData } from './mucourses';
import { initializeProfessor, updateProfessor } from './database';

import { writeProfessors } from './database';
import { TESTING, PROF_READ_LIMIT } from '../keys/config.json';

const firebaseConfig = {
    credential: cert(require('../keys/admin.json')),
};

// this scrapes mufaculty to get the information which creates professor objects
export async function createProfessorsFromCatalog(): Promise<Professor[]> {
    let professorBasicInfo = await getProfessorBasicInfo();
    const professorArray: Professor[] = [];
    professorBasicInfo.forEach((basicInfo) => {
        const newProf = new Professor(generateProfessorId(basicInfo), {
            basicInfo: basicInfo,
        });
        professorArray.push(newProf);
    });
    return professorArray;
}

// this function scrapes mucatalog, then puts the data in the database
export async function updateMUCatalog() {
    // getting database information
    const app = initializeApp(firebaseConfig);
    const db: Firestore = getFirestore(app);

    const professorArray = await createProfessorsFromCatalog();
    return await writeProfessors(db, professorArray);
}

// this function accesses data from mucatalog, then puts data in the database
export async function updateMUCourses() {
    // getting database information
    const app = initializeApp(firebaseConfig);
    const db: Firestore = getFirestore(app);

    const professorArray = TESTING
        ? await getSomeProfessors(db, PROF_READ_LIMIT)
        : await getAllProfessors(db);
    const updatedProfessorArray = await setProfessorObjectiveMetrics(
        professorArray,
    );
    return updatedProfessorArray;
}
