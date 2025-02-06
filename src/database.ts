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
    ObjectiveMetrics,
    SubjectiveMetrics,
    BasicInfo,
    Professor,
    AIPromptAnswers,
} from './models/professor';

export async function getProfessorFromID(
    db: Firestore,
    professorId: string,
): Promise<Professor | null> {
    const docRef = db.collection('professors').doc(professorId);
    const docSnapshot = await docRef.get();

    if (docSnapshot.exists) {
        console.log('FOUND IT!');
        return Professor.initFromObject(docSnapshot.data());
    } else {
        console.log("Didn't find it :( ");
        return null;
    }
}

// note: the name needs to be exact ;-;
export async function getProfessorsFromDepartment(
    db: Firestore,
    department: string,
): Promise<Professor[]> {
    const queryResult = await db
        .collection('professors')
        .where('basicInfo.department', '==', department)
        .get();
    const professors: Professor[] = [];
    queryResult.forEach((doc) => {
        professors.push(Professor.initFromObject(doc.data()));
    });
    return professors;
}

// enable overwrite if you expect that the professor already exists in the database.
export async function writeProfessor(db: Firestore, professor: Professor) {
    const docRef = db.collection('professors').doc(professor.professorId);

    const professorThatCanWrite = JSON.parse(JSON.stringify(professor));
    await docRef.set(professorThatCanWrite);
    console.log('Done!?');
}
