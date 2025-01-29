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
} from "../models/professor";

const firebaseConfig = {
  apiKey: "AIzaSyCTVLcu1yw9E3d_4HSTLBX0NmiWv0CmDFg",
  authDomain: "mizzoureview-5ca78.firebaseapp.com",
  projectId: "mizzoureview-5ca78",
  storageBucket: "mizzoureview-5ca78.firebasestorage.app",
  messagingSenderId: "723766935730",
  appId: "1:723766935730:web:3533034b41d624811489ab",
  measurementId: "G-N8V4BPHEQT",
  credential: cert(require("../keys/admin.json")),
};

const app = initializeApp(firebaseConfig);
const db: Firestore = getFirestore(app);

writeAndRead();

async function writeAndRead() {
  const jimrId: string = "oogabooga"
  const jimr: Professor = {
    professorId: jimrId 
  }
  await writeProfessor(jimr);
  await getProfessorDocumentFromID(jimrId);
}

async function getProfessorDocumentFromID(professorId: string) {
  const docRef = db.collection("professors").doc(professorId);
  const docSnapshot = await docRef.get();

  if (docSnapshot.exists) {
    console.log("FOUND IT!");
  } else {
    console.log("Didn't find it :( ");
  }
}

async function writeProfessor(professor: Professor) {
  const docRef = db.collection("professors").doc(professor.professorId);

  await docRef.set(professor);
  console.log("Done!?");
}
