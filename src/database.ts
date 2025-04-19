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

import { Professor } from 'mizzoureview-reading/models/professor';
import {
    getAllProfessors,
    getProfessorFromID,
    getProfessorsFromDepartment,
} from 'mizzoureview-reading/database-admin';

import { config } from 'dotenv';
config();
const TESTING = process.env.TESTING;

export interface WriteResult {
    success: boolean;
    message: string;
    data: Professor[];
}

export class BatchWriteInvalidParamsError extends Error {
    constructor(message: string) {
        super(message);
    }
}
export class BatchWriteFirestoreError extends Error {
    constructor(message: string) {
        super(message);
    }
}
async function batchWriteProfessors(
    db: Firestore,
    professorArray: Professor[],
): Promise<WriteResult> {
    if (professorArray.length > 500) {
        throw new BatchWriteInvalidParamsError(
            'Split this array before using this function; this array is too large',
        );
    }

    function batchSet(batch: WriteBatch, prof: Professor) {
        const docRef = db.collection('professors').doc(prof.professorId);
        const profData = JSON.parse(JSON.stringify(prof));
        batch.set(docRef, profData);
    }

    try {
        const batch: WriteBatch = db.batch();
        professorArray.forEach((prof) => batchSet(batch, prof));

        await batch.commit();
    } catch (err) {
        console.log(err);
        throw new BatchWriteFirestoreError(
            'Failure in batch write, shown above',
        );
    }
    return {
        success: true,
        message: 'Write successful',
        data: professorArray,
    };
}
// this is the exported function, should handle all problems in here
export async function writeProfessors(
    db: Firestore,
    professorArray: Professor[],
): Promise<WriteResult> {
    if (TESTING) {
        return {
            success: false,
            message:
                "Testing is turned on to not bankrupt TMNH, here's what would have been written",
            data: professorArray,
        };
    }
    // batch calls to firebase are in groups of 500, so split into these groups
    const professorSubArrays: Professor[][] = [];
    const maxArraySize = 500;
    for (let i = 0; i < professorArray.length; i = i + maxArraySize) {
        professorSubArrays.push(professorArray.slice(i, i + maxArraySize));
    }

    /* 
    // hold the promises which resolve upon the batch operations completing
    const promiseArray: Promise<WriteResult>[] = [];
    professorSubArrays.forEach((arr) =>
        promiseArray.push(batchWriteProfessors(db, arr)),
    );

    // wait for all the promises to complete
    const results = await Promise.allSettled(promiseArray);
    const failedWrites = results.filter(
        (result) => result.status === 'rejected',
    );
    */

    const results = await Promise.all(
        professorSubArrays.map((array) =>
            batchWriteProfessors(db, array).then(
                (res) => ({
                    status: 'fulfilled',
                    value: res,
                    professors: array,
                }),
                (err: Error) => ({
                    status: 'rejected',
                    value: err,
                    professors: array,
                }),
            ),
        ),
    );
    const failedWrites = results.filter((res) => res.value instanceof Error);

    if (failedWrites.length > 0) {
        const errorSet = new Set<Error>();
        failedWrites.forEach((failure) => {
            if (failure.value instanceof Error) {
                errorSet.add(failure.value);
            }
        });
        const errorString = Array(errorSet.values())
            .map((err) => err.toString())
            .join('\n');
        return {
            success: false,
            message: `These professors caused the following errors: ${errorString}`,
            data: failedWrites.map((failures) => failures.professors).flat(),
        };
    }
    return {
        success: true,
        message: 'Writes successful',
        data: results.map((res) => res.professors).flat(),
    };
}
