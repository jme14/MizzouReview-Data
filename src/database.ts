import { initializeApp, applicationDefault, cert } from "firebase-admin/app";
import {
  getFirestore,
  Firestore,
  Timestamp,
  FieldValue,
  Filter,
  CollectionReference,
  DocumentReference,
} from "firebase-admin/firestore";

import {
  ObjectiveMetrics,
  SubjectiveMetrics,
  BasicInfo,
  Professor,
  AIPromptAnswers,
} from  "./models/professor"

const firebaseConfig = {
  credential: cert(require("../keys/admin.json")),
};

const app = initializeApp(firebaseConfig);
const db: Firestore = getFirestore(app);

export async function getProfessorDocumentFromID(professorId: string) {
  const docRef = db.collection("professors").doc(professorId);
  const docSnapshot = await docRef.get();

  if (docSnapshot.exists) {
    console.log("FOUND IT!");
  } else {
    console.log("Didn't find it :( ");
  }
}

// enable overwrite if you expect that the professor already exists in the database.
export async function writeProfessor(professor: Professor) {
  const docRef = db.collection("professors").doc(professor.professorId);

  const professorThatCanWrite = JSON.parse(JSON.stringify(professor)) 
  await docRef.set(professorThatCanWrite);
  console.log("Done!?");
}