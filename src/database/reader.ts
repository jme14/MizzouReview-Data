import {
    getAllProfessors,
    getProfessorFromID,
    getProfessorsFromDepartment,
    getSomeProfessors,
} from 'mizzoureview-reading/database-admin';

import {
    getFirestore,
    Firestore,
    Timestamp,
    FieldValue,
    Filter,
    CollectionReference,
    DocumentReference,
    WriteBatch,
} from 'firebase-admin/firestore';

import { config } from 'dotenv';

export function getNumberArrayMetrics(
    arr: (number | undefined)[],
    lowerRange: number,
    higherRange: number,
    decimalPlaces: number,
    title?: string,
    showUndefined: boolean = true,
) {
    const dataSet = new Map<string, number>();

    arr.forEach((metric) => {
        const isUndefined = metric === undefined || metric === null;
        let key = '';

        if (isUndefined && !showUndefined) {
            return;
        } else if (isUndefined) {
            key = 'undefined';
        } else {
            key = metric.toFixed(decimalPlaces);
        }

        dataSet.set(key, (dataSet.get(key) || 0) + 1);
    });

    const maxLabelLength = Math.max(
        ...Array.from(dataSet.keys()).map((k) => k.length),
    );
    const maxCount = Math.max(...dataSet.values());
    const maxBarWidth = 50;

    // Print the histogram in Markdown-friendly format
    console.log('### Graph: ' + title);
    console.log('| Label            | Count | Bar |');
    console.log('|------------------|-------|-----|');

    const printMap = new Map<number, string>();

    for (const [label, count] of dataSet) {
        const barLength = Math.round((count / maxCount) * maxBarWidth);
        const bar = '█'.repeat(barLength);
        printMap.set(
            parseFloat(label),
            `| ${label.padEnd(maxLabelLength)} | ${count} | ${bar} |`,
        );
    }

    const incrementor = 1 / Math.pow(10, decimalPlaces);
    const result = printMap.get(NaN);
    if (result !== undefined) {
        console.log(result);
    }
    for (
        let i = lowerRange;
        i <= higherRange;
        i = Math.round((i + incrementor) * 100) / 100
    ) {
        const printStatement = printMap.get(i);
        if (printStatement === undefined) {
            continue;
        }
        console.log(printStatement);
    }
    console.log('\n');
}

// this provides information about how many of each string there is
export function getStringArrayMetrics(
    arr: (string | undefined)[],
    title?: string,
    showUndefined?: boolean,
) {
    if (showUndefined === undefined) {
        showUndefined = true;
    }

    const dataSet = new Map<string, number>();
    arr.forEach((metric) => {
        if (metric === undefined || metric === null) {
            if (!showUndefined) {
                return;
            }
            metric = 'undefined';
        }

        const currentCount = dataSet.get(metric);
        if (!currentCount) {
            dataSet.set(metric, 1);
        } else {
            dataSet.set(metric, currentCount + 1);
        }
    });

    // thanks chatgpt
    // Determine the maximum label length for alignment
    const maxLabelLength = Math.max(
        ...Array.from(dataSet.keys()).map((k) => k.length),
    );

    // Determine the maximum count to scale the bars
    const maxCount = Math.max(...dataSet.values());

    // Define the maximum width of the histogram bar
    const maxBarWidth = 50;

    const sortedEntries = Array.from(dataSet.entries()).sort(([a], [b]) =>
        a === 'undefined' ? -1 : b === 'undefined' ? 1 : a.localeCompare(b),
    );

    console.log('### Graph: ' + title);
    console.log('| Label            | Count | Bar |');
    console.log('|------------------|-------|-----|');

    for (const [label, count] of sortedEntries) {
        const barLength = Math.round((count / maxCount) * maxBarWidth);
        const bar = '█'.repeat(barLength);
        console.log(
            `| ${label.padEnd(maxLabelLength)} | ${count
                .toString()
                .padStart(5)} | ${bar} |`,
        );
    }

    console.log('\n');
}

export function getFunFactsArrayMetrics(arr: [string[] | undefined, string][]) {
    const populatedFunFacts = arr.filter((facts) => facts[0] !== undefined);

    console.log('### Fun Fact Gathering Information');
    console.log(
        `Fun facts are ${
            (populatedFunFacts.length * 100) / arr.length
        }% populated.`,
    );

    let invalidFunFactCount = 0;
    let invalidFunFactIds = [];
    let zeroFunFactCount = 0;
    let zeroFunFactIds = [];
    for (const funFacts of populatedFunFacts) {
        if (funFacts[0]!.length === 0) {
            zeroFunFactCount++;
            zeroFunFactIds.push(funFacts[1]);
            continue;
        }
        if (funFacts[0]!.length !== 5) {
            invalidFunFactCount++;
            invalidFunFactIds.push(funFacts[1]);
        }
    }

    console.log(
        `Populated fun facts have ${invalidFunFactCount} invalid fact count and ${zeroFunFactCount} with an empty array.\n`,
    );

    if (invalidFunFactIds.length > 0) {
        console.log('The following IDs contain invalid data.');
        invalidFunFactIds.forEach(console.log);
    }

    if (zeroFunFactIds.length > 0) {
        console.log('The following IDs contain empty arrays.');
        zeroFunFactIds.forEach(console.log);
    }
}
/**
 * Abstracts away needing to make sure we're testing before reading from a database
 * @param db
 * @returns
 */
export async function getProfessors(db: Firestore) {
    config();
    const TESTING = process.env.TESTING === 'false' ? false : true;
    const PROF_READ_LIMIT =
        process.env.PROF_READ_LIMIT !== undefined
            ? parseInt(process.env.PROF_READ_LIMIT)
            : 0;

    return TESTING
        ? getSomeProfessors(db, PROF_READ_LIMIT)
        : getAllProfessors(db);
}
export async function getDatabaseMetrics(db: Firestore) {
    config();
    const professors = (process.env.TESTING === 'false' ? false : true)
        ? await getSomeProfessors(db, 20)
        : await getAllProfessors(db);

    // basic info
    const departmentArray: (string | undefined)[] = [];
    const educationArray: (string | undefined)[] = [];
    const titleArray: (string | undefined)[] = [];
    const tenureArray: (number | undefined)[] = [];

    // objective metrics
    const gpaArray: (number | undefined)[] = [];
    const confidenceArray: (number | undefined)[] = [];

    // subjective metrics
    const qualityArray: (number | undefined)[] = [];
    const difficultyArray: (number | undefined)[] = [];
    const gradingIntensityArray: (number | undefined)[] = [];
    const attendanceArray: (number | undefined)[] = [];
    const textbookArray: (number | undefined)[] = [];
    const polarizingArray: (number | undefined)[] = [];

    // ai
    const letterToProfessorArray: (string | undefined)[] = [];
    const letterToStudentArray: (string | undefined)[] = [];
    const funFactsArray: [string[] | undefined, string][] = [];
    professors.forEach((prof) => {
        console.log(prof);
        // basic info
        departmentArray.push(prof.basicInfo?.department);
        educationArray.push(prof.basicInfo?.education);
        titleArray.push(prof.basicInfo?.title);
        tenureArray.push(prof.basicInfo?.tenure);

        // objective metrics
        gpaArray.push(prof.objectiveMetrics?.gpa);
        confidenceArray.push(prof.objectiveMetrics?.confidence);

        // subjective metrics
        qualityArray.push(prof.subjectiveMetrics?.quality);
        difficultyArray.push(prof.subjectiveMetrics?.difficulty);
        gradingIntensityArray.push(prof.subjectiveMetrics?.gradingIntensity);
        attendanceArray.push(prof.subjectiveMetrics?.attendance);
        textbookArray.push(prof.subjectiveMetrics?.textbook);
        polarizingArray.push(prof.subjectiveMetrics?.polarizing);

        // ai prompts
        letterToProfessorArray.push(prof.aIPromptAnswers?.letterToProfessor);
        letterToStudentArray.push(prof.aIPromptAnswers?.letterToStudent);
        funFactsArray.push([prof.aIPromptAnswers?.funFacts, prof.professorId]);
    });

    // 1. Basic Info (strings)
    console.log('## Basic Info:');
    getStringArrayMetrics(departmentArray, 'Department', true);
    getStringArrayMetrics(educationArray, 'Education', true);
    getStringArrayMetrics(titleArray, 'Title', true);

    // 2. Objective Metrics (numbers)
    console.log('\n## Objective Metrics:');
    getNumberArrayMetrics(tenureArray, 0, 100, 0, 'Tenure', true);
    getNumberArrayMetrics(gpaArray, 0, 4, 1, 'GPA', true);
    getNumberArrayMetrics(confidenceArray, 0, 100, 0, 'Confidence', true);

    // 3. Subjective Metrics (numbers)
    console.log('\n## Subjective Metrics:');
    getNumberArrayMetrics(qualityArray, 0, 10, 0, 'Quality', true);
    getNumberArrayMetrics(difficultyArray, 0, 10, 0, 'Difficulty', true);
    getNumberArrayMetrics(
        gradingIntensityArray,
        0,
        10,
        0,
        'Grading Intensity',
        true,
    );
    getNumberArrayMetrics(attendanceArray, 0, 10, 0, 'Attendance', true);
    getNumberArrayMetrics(textbookArray, 0, 10, 0, 'Textbook', true);
    getNumberArrayMetrics(polarizingArray, 0, 10, 0, 'Polarizing', true);

    getFunFactsArrayMetrics(funFactsArray);
    // === Now the `false` versions ===

    /* 
    // 1. Basic Info (strings)
    console.log('## Basic Info:');
    getStringArrayMetrics(departmentArray, 'Department', false);
    getStringArrayMetrics(educationArray, 'Education', false);
    getStringArrayMetrics(titleArray, 'Title', false);

    // 2. Objective Metrics (numbers)
    console.log('\n## Objective Metrics:');
    getNumberArrayMetrics(tenureArray, 0, 100, 0, 'Tenure', false);
    getNumberArrayMetrics(gpaArray, 0, 4, 1, 'GPA', false);
    getNumberArrayMetrics(confidenceArray, 0, 100, 0, 'Confidence', false);

    // 3. Subjective Metrics (numbers)
    console.log('\n## Subjective Metrics:');
    getNumberArrayMetrics(qualityArray, 0, 10, 0, 'Quality', false);
    getNumberArrayMetrics(difficultyArray, 0, 10, 0, 'Difficulty', false);
    getNumberArrayMetrics(
        gradingIntensityArray,
        0,
        10,
        0,
        'Grading Intensity',
        false,
    );
    getNumberArrayMetrics(attendanceArray, 0, 10, 0, 'Attendance', false);
    getNumberArrayMetrics(textbookArray, 0, 10, 0, 'Textbook', false);
    getNumberArrayMetrics(polarizingArray, 0, 10, 0, 'Polarizing', false);
    */
}
