import {
    getAllProfessors,
    getProfessorFromID,
    getProfessorsFromDepartment,
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

import asciichart from 'asciichart';

export async function getNumberArrayMetrics(arr: (number | undefined)[]) {
    const dataSet = new Map<string, number>();

    arr.forEach((metric) => {
        const key = metric === undefined ? 'undefined' : metric.toString();
        dataSet.set(key, (dataSet.get(key) || 0) + 1);
    });

    const maxLabelLength = Math.max(
        ...Array.from(dataSet.keys()).map((k) => k.length),
    );
    const maxCount = Math.max(...dataSet.values());
    const maxBarWidth = 50;

    // Sort entries: prioritize 'undefined' first, then sort by number
    const sortedEntries = Array.from(dataSet.entries()).sort(([a], [b]) =>
        a === 'undefined' ? -1 : b === 'undefined' ? 1 : a.localeCompare(b),
    );

    // Print the histogram
    for (const [label, count] of sortedEntries) {
        const barLength = Math.round((count / maxCount) * maxBarWidth);
        const bar = '█'.repeat(barLength);
        console.log(`${label.padEnd(maxLabelLength)} | ${bar} (${count})`);
    }
}

// this provides information about how many of each string there is
export async function getStringArrayMetrics(arr: (string | undefined)[]) {
    const dataSet = new Map<string, number>();
    arr.forEach((metric) => {
        if (metric === undefined) {
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

    for (const [label, count] of sortedEntries) {
        const barLength = Math.round((count / maxCount) * maxBarWidth);
        const bar = '█'.repeat(barLength);
        console.log(`${label.padEnd(maxLabelLength)} | ${bar} (${count})`);
    }
}
export async function getDatabaseMetrics(db: Firestore) {
    const professors = await getAllProfessors(db);

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
}
