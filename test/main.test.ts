import { describe, expect, test } from 'vitest';
import { Name } from 'mizzoureview-reading';
import { BasicInfo } from 'mizzoureview-reading';
import { getCourses } from '../src/mucourses';
import { updateMUCatalog, updateMUCourses } from '../src/main';
import { TESTING, PROF_READ_LIMIT } from '../keys/config.json';

describe('onProfessorName', async () => {
    test('updateMUCatalog()', async () => {
        // don't run if we don't want to write a billion things
        if (TESTING) {
            return;
        }

        const professorArray = await updateMUCatalog();
        console.log(professorArray);
        expect(professorArray.success).toBeTruthy();
    });
    test('updateMUCourses()', async() => {
        if (TESTING){
            const professors = await updateMUCourses()
            expect(professors).toBe(PROF_READ_LIMIT)
        }
    })
});
