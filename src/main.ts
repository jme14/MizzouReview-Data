/*
This module is for using the content in other modules and writing to the database

There are two major types of functions here
1) object updaters (start with update)
    these take Professor[] and returns true or false depending on success
2) array writers (start with write)
    these do the specified operation, then writes them to the database
    these throw an error on failure 

There's also the object creator function, which obtains the list of names in the first place
*/
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

import { getProfessorBasicInfo } from './mucatalog.js';
import {
    getCoursesByProfessor,
    setProfessorObjectiveMetrics,
} from './mucourses.js';
import { getArticleContentByName } from './wikipedia.js';

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

import { writeProfessors } from './database';
import { TESTING, PROF_READ_LIMIT, RMP_ARRAY_LIMIT } from '../keys/config.json';
import { getPage, setProfessorSubjectiveMetricsLimited } from './rmp';
import { filter } from 'cheerio/dist/commonjs/api/traversing';

type WriteOptions = {
    mucatalog?: boolean;
    mucourses?: boolean;
    wikipedia?: boolean;
    rmp?: boolean;
};
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
export async function writeMUCatalog() {
    // getting database information
    const app = initializeApp(firebaseConfig);
    const db: Firestore = getFirestore(app);

    const professorArray = await createProfessorsFromCatalog();
    return await writeProfessors(db, professorArray);
}

export async function initializeProfessorArrayFromDB() {
    // getting database information
    const app = initializeApp(firebaseConfig);
    const db: Firestore = getFirestore(app);

    const professorArray = TESTING
        ? await getSomeProfessors(db, PROF_READ_LIMIT)
        : await getAllProfessors(db);
    return {
        db: db,
        professorArray: professorArray,
    };
}
// this function accesses data from mucatalog, then puts data in the database
// (just a wrapper over setProfessorObjectiveMetrics from mucourses module)
export async function updateMUCourses(
    professorArray: Professor[],
): Promise<Boolean> {
    return await setProfessorObjectiveMetrics(professorArray);
}
/**
 * Writes to db professor array after getting professor array from database
 * throws error on failure
 * @returns NEED STANDARDIZING
 */
export async function writeMUCourses() {
    const { db, professorArray } = await initializeProfessorArrayFromDB();
    const mucoursesSuccess = await updateMUCourses(professorArray);

    if (!mucoursesSuccess) {
        throw new Error('Failed to update professors with mucourses data');
    }

    return await writeProfessors(db, professorArray);
}

/* this rmp section is going to be kinda stupid */

export async function writeRMP() {
    const { db, professorArray } = await initializeProfessorArrayFromDB();

    const filteredProfessorArray = professorArray.filter(
        (professor) =>
            professor.basicInfo &&
            professor.objectiveMetrics &&
            professor.objectiveMetrics.gpa != 0,
    );
    let professorSubarrays: Professor[][] = [];

    for (let i = 0; i < filteredProfessorArray.length; i += RMP_ARRAY_LIMIT) {
        professorSubarrays.push(
            filteredProfessorArray.slice(i, i + RMP_ARRAY_LIMIT),
        );
    }

    const { browser, page } = await getPage();

    for (let i = 0; i < professorSubarrays.length; i++) {
        await setProfessorSubjectiveMetricsLimited(
            browser,
            page,
            professorSubarrays[i],
        );
        await writeProfessors(db, professorSubarrays[i]);
    }
    return true;
}

// if running the entire module at once, call this function with all options enabled
// more efficient than reading and writing for each submodule over and over
// because this function only writes to db once after all interactions have been managed
export async function writeOptions(options: WriteOptions) {
    // this means that everything is false
    if (!Object.values(options).some(Boolean)) {
        return {
            success: true,
            message: 'No options passed in, nothing to be done',
        };
    }

    let db: Firestore;
    let professorArray: Professor[];

    // if getting new mucatalog info requested, do that
    if (options.mucatalog) {
        db = getFirestore(initializeApp(firebaseConfig));
        professorArray = await createProfessorsFromCatalog();
        // otherwise, just read from the array
    } else {
        ({ db, professorArray } = await initializeProfessorArrayFromDB());
    }

    if (options.mucourses) {
        const mucoursesSuccess = await updateMUCourses(professorArray);
        if (!mucoursesSuccess) {
            throw new Error('Failure to update with mucourses data');
        }
    }

    return await writeProfessors(db, professorArray);
}
