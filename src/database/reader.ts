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

export async function getNumberArrayMetrics(
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
export async function getStringArrayMetrics(
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
    const funFactsArray: (string | undefined)[] = [];
    professors.forEach((prof) => {
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
        funFactsArray.push(prof.aIPromptAnswers?.funFacts);
    });

    // 1. Basic Info (strings)
    console.log('## Basic Info:');
    await getStringArrayMetrics(departmentArray, 'Department', true);
    await getStringArrayMetrics(educationArray, 'Education', true);
    await getStringArrayMetrics(titleArray, 'Title', true);

    // 2. Objective Metrics (numbers)
    console.log('\n## Objective Metrics:');
    await getNumberArrayMetrics(tenureArray, 0, 100, 0, 'Tenure', true);
    await getNumberArrayMetrics(gpaArray, 0, 4, 1, 'GPA', true);
    await getNumberArrayMetrics(confidenceArray, 0, 100, 0, 'Confidence', true);

    // 3. Subjective Metrics (numbers)
    console.log('\n## Subjective Metrics:');
    await getNumberArrayMetrics(qualityArray, 0, 10, 0, 'Quality', true);
    await getNumberArrayMetrics(difficultyArray, 0, 10, 0, 'Difficulty', true);
    await getNumberArrayMetrics(
        gradingIntensityArray,
        0,
        10,
        0,
        'Grading Intensity',
        true,
    );
    await getNumberArrayMetrics(attendanceArray, 0, 10, 0, 'Attendance', true);
    await getNumberArrayMetrics(textbookArray, 0, 10, 0, 'Textbook', true);
    await getNumberArrayMetrics(polarizingArray, 0, 10, 0, 'Polarizing', true);

    // === Now the `false` versions ===

    // 1. Basic Info (strings)
    console.log('## Basic Info:');
    await getStringArrayMetrics(departmentArray, 'Department', false);
    await getStringArrayMetrics(educationArray, 'Education', false);
    await getStringArrayMetrics(titleArray, 'Title', false);

    // 2. Objective Metrics (numbers)
    console.log('\n## Objective Metrics:');
    await getNumberArrayMetrics(tenureArray, 0, 100, 0, 'Tenure', false);
    await getNumberArrayMetrics(gpaArray, 0, 4, 1, 'GPA', false);
    await getNumberArrayMetrics(
        confidenceArray,
        0,
        100,
        0,
        'Confidence',
        false,
    );

    // 3. Subjective Metrics (numbers)
    console.log('\n## Subjective Metrics:');
    await getNumberArrayMetrics(qualityArray, 0, 10, 0, 'Quality', false);
    await getNumberArrayMetrics(difficultyArray, 0, 10, 0, 'Difficulty', false);
    await getNumberArrayMetrics(
        gradingIntensityArray,
        0,
        10,
        0,
        'Grading Intensity',
        false,
    );
    await getNumberArrayMetrics(attendanceArray, 0, 10, 0, 'Attendance', false);
    await getNumberArrayMetrics(textbookArray, 0, 10, 0, 'Textbook', false);
    await getNumberArrayMetrics(polarizingArray, 0, 10, 0, 'Polarizing', false);
}
