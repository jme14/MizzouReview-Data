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
} from "./models/professor";
import { writeProfessor, getProfessorsFromDepartment, getProfessorFromID } from "./database";

const firebaseConfig = {
    credential: cert(require("../keys/admin.json")),
};

const app = initializeApp(firebaseConfig);
const db: Firestore = getFirestore(app);

async function test_read_write(db: Firestore, prof: Professor) {
    const id = prof.professorId;
    await writeProfessor(db, prof);
    const doc = await getProfessorFromID(db, id)
    console.log("This is the document I obtained:")
    console.log(doc)
    const all_cs_profs = await getProfessorsFromDepartment(db, "Computer Science")
    all_cs_profs.forEach((prof) => console.log(prof))
}

test_read_write(
    db,
    new Professor("jimr", {
        basicInfo: {
            fname: "Jim",
            lname: "Ries",
            department: "Computer Science",
        },
    })
);
