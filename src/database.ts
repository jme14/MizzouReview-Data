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
  const basicInfo = new BasicInfo("John", "Doe", "Computer Science", {
    mname: "A",
    title: "Dr.",
    education: "PhD",
    tenure: 5,
  });

  const objectiveMetrics = new ObjectiveMetrics(3.8, 95);

  const subjectiveMetrics = new SubjectiveMetrics({
    quality: 8,
    difficulty: 7,
    gradingIntensity: 6,
    attendance: 9,
    textbook: 7,
    polarizing: 5,
  });

  const aIPromptAnswers = new AIPromptAnswers({
    letterToProfessor:
      "Dear Professor, I have a few questions about the upcoming assignment.",
    letterToStudent:
      "Dear Student, I received your message and will get back to you shortly.",
    funFacts: "I once taught a class while riding a unicycle!",
  });

  // Create the fully populated Professor object
  const professorData = new Professor("prof123", {
    basicInfo: basicInfo,
    objectiveMetrics: objectiveMetrics,
    subjectiveMetrics: subjectiveMetrics,
    aIPromptAnswers: aIPromptAnswers,
  });
  
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