import {
    getFirestore,
    Firestore,
    Timestamp,
    FieldValue,
    Filter,
    CollectionReference,
    DocumentReference,
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
