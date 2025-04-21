import { Firestore } from 'firebase-admin/firestore';

import inquirer from 'inquirer';

import { Professor } from 'mizzoureview-reading/models/professor';

import { getProfessors } from '../database/reader.js';
import { getProfessorBasicInfo } from '../collection/mucatalog.js';
import { setProfessorMUCoursesData } from '../collection/mucourses.js';
import { generateProfessorId } from '../helpers/professorId.js';
import { writeProfessors } from '../database/writer.js';
/* 
import { config } from 'dotenv';
config();
const TESTING = process.env.TESTING === 'false' ? false : true;
const PROF_READ_LIMIT = parseInt(process.env.PROF_READ_LIMIT || '-1', 10);
const RMP_ARRAY_LIMIT = parseInt(process.env.RMP_ARRAY_LIMIT || '-1', 10);
*/

// this scrapes mufaculty to get the information which creates professor objects
/* THIS CREATES */
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

// this function accesses data from mucatalog, then puts data in the database
// (just a wrapper over setProfessorObjectiveMetrics from mucourses module)
export async function updateMUCourses(
    professorArray: Professor[],
): Promise<Boolean> {
    return await setProfessorMUCoursesData(professorArray);
}

interface WriteFastDataOptions {
    mucourses: boolean;
    mucatalog: boolean;
}
interface WriteFastDataResult {
    success: boolean;
    message: string;
    professorArray: Professor[] | undefined;
}
export async function writeFastData(
    db: Firestore,
    options: WriteFastDataOptions,
): Promise<WriteFastDataResult> {
    if (!Object.values(options).some(Boolean)) {
        return {
            success: true,
            message: 'No options passed in, nothing to be done',
            professorArray: undefined,
        };
    }

    let professorArray: Professor[];

    // if getting new mucatalog info requested, do that
    if (options.mucatalog) {
        professorArray = await createProfessorsFromCatalog();
        // otherwise, just read from the database
    } else {
        professorArray = await getProfessors(db);
    }

    if (options.mucourses) {
        const mucoursesSuccess = await updateMUCourses(professorArray);
        if (!mucoursesSuccess) {
            throw new Error('Failure to update with mucourses data');
        }
    }

    // write from this data quick to get, then writeRMP writes professors 10 at a time
    const writeResult = await writeProfessors(db, professorArray);
    if (!writeResult.success) {
        console.log(writeResult.message);
        const { confirm } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: `Something has gone wrong in the first database write, do you wish to continue?`,
                default: false,
            },
        ]);
        if (!confirm) {
            return {
                success: false,
                message: 'Failure after first write',
                professorArray: professorArray,
            };
        }
    }
    return {
        success: true,
        message: `Success with mucatalog: ${options.mucatalog} and mucourses: ${options.mucourses}`,
        professorArray: professorArray,
    };
}
