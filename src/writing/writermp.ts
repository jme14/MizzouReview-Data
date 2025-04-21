import { Firestore } from 'firebase-admin/firestore';
import cliProgress from 'cli-progress';
import { Browser, Page } from 'playwright';
import { Professor } from 'mizzoureview-reading/models/professor';

import { getProfessors } from '../database/reader.js';
import { initializeDatabase } from '../database/initializer.js';
import { writeProfessors } from '../database/writer.js';
import {
    getPage,
    setProfessorSubjectiveMetricsLimited,
    sleep,
} from '../collection/rmp.js';

import { config } from 'dotenv';
config();
const RMP_ARRAY_LIMIT = parseInt(process.env.RMP_ARRAY_LIMIT || '-1', 10);

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

    if (!db) {
        db = initializeDatabase();
    }
    if (!professorArray) {
        professorArray = await getProfessors(db);
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
