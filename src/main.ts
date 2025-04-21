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
import {
    initializeApp,
    applicationDefault,
    cert,
    ServiceAccount,
} from 'firebase-admin/app';
import {
    getFirestore,
    Firestore,
    Timestamp,
    FieldValue,
    Filter,
    CollectionReference,
    DocumentReference,
} from 'firebase-admin/firestore';

import cliProgress from 'cli-progress';
import inquirer from 'inquirer';

import { Professor } from 'mizzoureview-reading/models/professor';
import {
    getAllProfessors,
    getSomeProfessors,
} from 'mizzoureview-reading/database-admin';

import { getProfessors } from './database/reader.js';
import { getProfessorBasicInfo } from './collection/mucatalog.js';
import {
    getCoursesByProfessor,
    setProfessorMUCoursesData,
} from './collection/mucourses.js';
import { generateProfessorId } from './helpers/professorId.js';
import { initializeDatabase } from './database/initializer.js';
import { writeProfessors, WriteResult } from './database/writer.js';
import {
    getPage,
    setProfessorSubjectiveMetricsLimited,
    sleep,
} from './collection/rmp.js';
import { Browser, Page } from 'playwright';

type WriteOptions = {
    mucatalog?: boolean;
    mucourses?: boolean;
    wikipedia?: boolean;
    rmp?: boolean;
    rmpOverwrite?: boolean;
};

import { config } from 'dotenv';
config();
const TESTING = process.env.TESTING === 'false' ? false : true;
const PROF_READ_LIMIT = parseInt(process.env.PROF_READ_LIMIT || '-1', 10);
const RMP_ARRAY_LIMIT = parseInt(process.env.RMP_ARRAY_LIMIT || '-1', 10);
/* 
const serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url:
        process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
} as ServiceAccount;
const firebaseConfig = {
    credential: cert(serviceAccount),
};
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

/* this rmp section is going to be kinda stupid */
export function filterProfessorsForRMP(
    professors: Professor[],
    forceUpdateAllRecords: Boolean,
) {
    const allValidProfessors = professors.filter(
        (professor) =>
            // they must have a basic info
            professor.basicInfo &&
            // they must have objective metrics
            professor.objectiveMetrics &&
            // they must have a gpa (suggests they teach classes)
            professor.objectiveMetrics.gpa != 0,
        // they must not have subjective metrics initialized
    );
    if (forceUpdateAllRecords) {
        return allValidProfessors;
    }
    const professorsSubjectiveUninitialized = allValidProfessors.filter(
        (prof) => !prof.subjectiveMetrics,
    );
    return professorsSubjectiveUninitialized;
}

class SearchRMPInvalidParamsError extends Error {
    constructor(message: string) {
        super(message);
    }
}
class SearchRMPCrashError extends Error {
    constructor(message: string) {
        super(message);
    }
}
export async function searchRMP(
    oldBrowser: Browser,
    oldPage: Page,
    shortProfessors: Professor[],
    retryCounter: number,
    innerBar: cliProgress.SingleBar,
) {
    let success: Boolean = true;
    try {
        success = await setProfessorSubjectiveMetricsLimited(
            oldBrowser,
            oldPage,
            shortProfessors,
            innerBar,
        );
        if (!success) {
            innerBar.stop();
            throw new SearchRMPInvalidParamsError(
                'Params invalid in searchRMP',
            );
        }
    } catch (err) {
        // if params error, throw it upward
        if (err instanceof SearchRMPInvalidParamsError) {
            innerBar.stop();
            throw err;
        }

        // otherwise, something unintended went wrong with the browser, and we need to restart

        await oldBrowser.close();
        if (retryCounter > 0) {
            // exponential backoff
            await sleep(27 / (retryCounter * retryCounter));
            const { browser, page } = await getPage();
            return searchRMP(
                browser,
                page,
                shortProfessors,
                retryCounter - 1,
                innerBar,
            );
        }
        innerBar.stop();
        throw new SearchRMPCrashError('Retried and cannot load content.');
    }
    innerBar.stop();
}

export interface WriteRMPOptions {
    db?: Firestore;
    professorArray?: Professor[];
    forceUpdateRecords?: boolean;
}
export async function writeRMP(options?: WriteRMPOptions) {
    if (options == undefined) {
        options = {
            db: undefined,
            professorArray: undefined,
            forceUpdateRecords: false,
        };
    }

    let db: Firestore | undefined =
        options.db != undefined ? options.db : undefined;
    let professorArray: Professor[] | undefined = options.professorArray;
    let forceUpdateRecords =
        options.forceUpdateRecords == undefined
            ? false
            : options.forceUpdateRecords;

    if (!db){
        db = initializeDatabase()
    }
    if (!professorArray){
        professorArray = await getProfessors(db)
    }
    if (!db || !professorArray) {
        return false;
    }
    const filteredProfessorArray = filterProfessorsForRMP(
        professorArray,
        forceUpdateRecords,
    );
    let professorSubarrays: Professor[][] = [];

    for (let i = 0; i < filteredProfessorArray.length; i += RMP_ARRAY_LIMIT) {
        professorSubarrays.push(
            filteredProfessorArray.slice(i, i + RMP_ARRAY_LIMIT),
        );
    }

    const { browser, page } = await getPage();

    let fatalErrorCounter = 0;
    let lastRunFatalError = false;
    /* 
    // create a new progress bar instance
    const progressBar = new cliProgress.SingleBar({
        format: 'Progress |{bar}| {percentage}% || {value}/{total} items',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true,
    });
    */

    // Create a multi bar instance
    const multibar = new cliProgress.MultiBar(
        {
            clearOnComplete: true,
            hideCursor: true,
            format: '{bar} | {percentage}% | {value}/{total} | {label}',
        },
        cliProgress.Presets.shades_classic,
    );

    // Create two progress bars
    const outerBar = multibar.create(professorSubarrays.length - 1, 0, {
        label: 'Professor Groups',
    });
    const innerBar = multibar.create(RMP_ARRAY_LIMIT - 1, 0, {
        label: 'Professors in Group',
    });
    // progressBar.start(professorSubarrays.length, 0);
    for (let i = 0; i < professorSubarrays.length; i++) {
        try {
            innerBar.setTotal(professorSubarrays[i].length);
            innerBar.update(0);
            await searchRMP(browser, page, professorSubarrays[i], 3, innerBar);
        } catch (err) {
            if (err instanceof SearchRMPCrashError) {
                if (lastRunFatalError) {
                    console.log('TERMINATING SEARCH, TOO MANY FAILURES');
                    return false;
                }
                console.log(
                    'WARNING: FATAL ERROR, IF THIS HAPPENS AGAIN I WILL TERMINATE THE PROGRAM',
                );
                fatalErrorCounter++;
                lastRunFatalError = true;
            } else if (err instanceof SearchRMPInvalidParamsError) {
                console.log('The following array has invalid data:');
                professorSubarrays[i].forEach((prof) => console.log(prof));
            }
            // only write professors if everything went okay
            continue;
        } finally {
            outerBar.update(i + 1);
        }
        await writeProfessors(db, professorSubarrays[i]);
    }
    outerBar.stop();
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

    let db: Firestore= initializeDatabase();
    let professorArray: Professor[];

    // if getting new mucatalog info requested, do that
    if (options.mucatalog) {
        professorArray = await createProfessorsFromCatalog();
    // otherwise, just read from the database 
    } else {
        professorArray = await getProfessors(db)
    }

    if (options.mucourses) {
        const mucoursesSuccess = await updateMUCourses(professorArray);
        if (!mucoursesSuccess) {
            throw new Error('Failure to update with mucourses data');
        }
    }

    if (options.mucatalog || options.mucourses) {
        // write from this data quick to get, then writeRMP writes professors 10 at a time
        const firstWriteResult = await writeProfessors(db, professorArray);
        if (!firstWriteResult.success) {
            console.log(firstWriteResult.message);
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
                };
            }
        }
    }

    if (options.rmp) {
        const writeRMPSuccess = await writeRMP({
            db: db,
            professorArray: professorArray,
        });
        if (writeRMPSuccess) {
            console.log('Success writing RMP data!');
        } else {
            console.log('Failure writing RMP data...');
        }
        return {
            success: true,
            message: `Finished with settings ${options}`,
        };
    } else if (options.rmpOverwrite) {
        const writeRMPSuccess = await writeRMP({
            db: db,
            professorArray: professorArray,
            forceUpdateRecords: true,
        });
        if (writeRMPSuccess) {
            console.log('Success writing RMP data!');
        } else {
            console.log('Failure writing RMP data...');
        }
        return {
            success: true,
            message: `Finished with settings ${JSON.stringify(options)}`,
        };
    }
}
