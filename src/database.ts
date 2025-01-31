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
} from "src/models/professor";

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
  const professorData: Professor = {
    professorId: "prof-12345",
    basicInfo: {
      fname: "John",
      mname: "A.",
      lname: "Doe",
      title: "Dr.",
      department: "Computer Science",
      education: "Ph.D. in Artificial Intelligence",
      tenure: 10,
    },
    objectiveMetrics: {
      gpa: 3.9,
      confidence: 95,
    },
    subjectiveMetrics: {
      quality: 4.7,
      difficulty: 3.2,
      gradingIntensity: 4.0,
      attendance: 2.5,
      textbook: 3.8,
      polarizing: 4.5,
    },
    aIPromptAnswers: {
      letterToProfessor:
        "Dear Professor Doe, your teaching has profoundly impacted my learning journey...",
      letterToStudent:
        "Dear student, always strive for excellence and embrace challenges...",
      funFacts: "Dr. Doe once built an AI that could generate dad jokes.",
    },
  };
  await writeProfessor(professorData);
  await getProfessorDocumentFromID(professorData.professorId);
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

// enable overwrite if you expect that the professor already exists in the database.
async function writeProfessor(professor: Professor) {
  const docRef = db.collection("professors").doc(professor.professorId);

  console.log(professor);
  await docRef.set(professor);
  console.log("Done!?");
}


// TESTING THAT THE INPUTS ARE VALID FOR A GIVEN PROFESSOR 