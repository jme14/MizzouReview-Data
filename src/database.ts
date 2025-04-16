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

import { TESTING } from "../keys/config.json"

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
    if (TESTING){
        return {
            success: false,
            message: "Testing is turned on to not bankrupt TMNH, here's what would have been written",
            data: professorArray
        }
    }
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