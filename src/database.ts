import {
    getFirestore,
    Firestore,
    Timestamp,
    FieldValue,
    Filter,
    CollectionReference,
    DocumentReference,
    WriteBatch
} from 'firebase-admin/firestore';

import {
    Professor, Name
} from "mizzoureview-reading"

import {
   getAllProfessors,
   getProfessorFromID,
   getProfessorsFromDepartment 
} from "mizzoureview-reading"
type Result<T> = {
    success: boolean;
    message: string;
    data?: T;
};

async function batchWriteProfessors(db: Firestore, professorArray: Professor[]): Promise<Result<Professor[]>>{
    if (professorArray.length > 500){
        throw new Error("Split this array before using this function; this array is too large")
    }

    function batchSet(prof: Professor){
        const docRef = db.collection("professors").doc(prof.professorId)
        const profData = JSON.parse(JSON.stringify(prof)) 
        batch.set(docRef, profData)
    }

    const batch: WriteBatch = db.batch()
    professorArray.forEach(batchSet)

    await batch.commit()
    return {
        success: true,
        message: "Write successful",
        data: professorArray
    }
}
// this is the exported function, should handle all problems in here
export async function writeProfessors(db: Firestore, professorArray: Professor[]){

    // batch calls to firebase are in groups of 500, so split into these groups 
    const professorSubArrays: Professor[][] = []
    const maxArraySize = 500
    for ( let i = 0 ; i < professorArray.length ; i=i+maxArraySize){
        professorSubArrays.push(professorArray.slice(i,i+maxArraySize))
    }

    // hold the promises which resolve upon the batch operations completing
    const promiseArray: Promise<Result<Professor[]>>[] = []
    professorSubArrays.forEach((arr) => promiseArray.push(batchWriteProfessors(db, arr)))
    
    // wait for all the promises to complete 
    const results = await Promise.allSettled(promiseArray)
    const failedWrites = results.filter((result) => result.status === "rejected")
    if (failedWrites.length > 0){
        return {
            success: false,
            message: "Some batches failed",
            data: results
        }
    }
    return {
        success: true,
        message: "Writes successful",
        data: results
    }
}

// enable overwrite if you expect that the professor already exists in the database.
/**
 * ONLY USE THIS FOR TESTING!
 * @param {Firestore} db
 * @param {Professor} professor
 */
export async function writeProfessor(
    db: Firestore,
    professor: Professor,
): Promise<Result<Professor>> {
    // get a professor object doc referrence from the professor.id
    const docRef = db.collection('professors').doc(professor.professorId);

    // convert professor object into JSON object
    const professorThatCanWrite = JSON.parse(JSON.stringify(professor));

    // write the JSON object into the doc reference
    await docRef.set(professorThatCanWrite);

    return {
        success: true,
        message: 'Success',
        data: professor,
    };
}

/**
 * Use this for new professors
 * @param db
 * @param professor
 * @returns
 */
export async function initializeProfessor(
    db: Firestore,
    professor: Professor,
): Promise<Result<Professor>> {
    // try to find the professor with this id
    const potentialProfessor = await getProfessorFromID(
        db,
        professor.professorId,
    );

    // if it already exists, return failure
    if (potentialProfessor != null) {
        return {
            success: false,
            message:
                'This professor already exists. Use updateProfessor instead',
        };
    }

    // otherwise, go ahead and write the professor
    const writeProfessorResult = await writeProfessor(db, professor);

    return writeProfessorResult;
}

/**
 * Use this to update an existing professor record
 * @param db 
 * @param professor 
 * @returns 
 */
export async function updateProfessor(
    db: Firestore,
    professor: Professor,
): Promise<Result<Professor>> {
    // try to find the professor with this id
    const potentialProfessor = await getProfessorFromID(
        db,
        professor.professorId,
    );

    // if it doesn't exist, return failure
    if (potentialProfessor != null) {
        return {
            success: false,
            message:
                "This professor doesn't exist. Use initializeProfessor instead",
        };
    }

    // otherwise, go ahead and write the professor
    const writeProfessorResult = await writeProfessor(db, professor);

    return writeProfessorResult;
}
