import { Firestore } from 'firebase-admin/firestore';
import { Professor } from 'mizzoureview-reading/models/professor';
import { initializeDatabase } from '../database/initializer.js';
import { writeFastData } from '../writing/writefastdata.js';
import { writeRMP } from '../writing/writermp.js';

interface WriteOptions {
    mucatalog: boolean;
    mucourses: boolean;
    wikipedia: boolean;
    rmp: boolean;
    rmpOverwrite: boolean;
}
// if running the entire module at once, call this function with all options enabled
// more efficient than reading and writing for each submodule over and over
// because this function only writes to db once after all interactions have been managed
export async function writeOptions(options: WriteOptions) {
    // this means that everything is false
    if (!Object.values(options).some(Boolean)) {
        return {
            success: true,
            message: 'No options passed in, nothing to be done',
        };
    }

    let db: Firestore = initializeDatabase();
    const writeFastDataResult = await writeFastData(db, {
        mucatalog: options.mucatalog,
        mucourses: options.mucourses,
    });

    if (
        !writeFastDataResult.success ||
        writeFastDataResult.professorArray === undefined
    ) {
        console.log(writeFastDataResult.professorArray);
        console.log(writeFastDataResult.message);
        return {
            success: false,
            message: 'Failure in writeFastData',
        };
    }
    let professorArray: Professor[] = writeFastDataResult.professorArray;

    if (options.rmp) {
        const writeRMPSuccess = await writeRMP({
            db: db,
            professorArray: professorArray,
        });
        if (writeRMPSuccess) {
            console.log('Success writing RMP data!');
        } else {
            console.log('Failure writing RMP data...');
        }
    } else if (options.rmpOverwrite) {
        const writeRMPSuccess = await writeRMP({
            db: db,
            professorArray: professorArray,
            forceUpdateRecords: true,
        });
        if (writeRMPSuccess) {
            console.log('Success writing RMP data!');
        } else {
            console.log('Failure writing RMP data...');
        }
    }
    return {
        success: true,
        message: `Finished with settings ${JSON.stringify(options)}`,
    };
}
