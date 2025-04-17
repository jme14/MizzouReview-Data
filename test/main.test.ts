import { describe, expect, test } from 'vitest';

import { Professor } from 'mizzoureview-reading/models/professor';

import {
    createProfessorsFromCatalog,
    updateMUCourses,
    writeRMP,
} from '../src/main';

describe.skip('professor object management', () => {
    let mucatalogProfessorArray: Professor[];
    let mucoursesProfessorArray: Professor[];

    test('createProfessorsFromCatalog()', async () => {
        mucatalogProfessorArray = await createProfessorsFromCatalog();
        expect(mucatalogProfessorArray).toBeTruthy();
        expect(mucatalogProfessorArray.length).toBeGreaterThan(0);
    });

    test('updateMUCourses()', async () => {
        mucoursesProfessorArray = mucatalogProfessorArray;

        // deep copy to keep track of how array has changed
        mucatalogProfessorArray = mucatalogProfessorArray.map((prof) => ({
            ...prof,
        }));

        const mucoursesSuccess = await updateMUCourses(mucoursesProfessorArray);

        // no elements should be lost
        expect(mucoursesSuccess).toBeTruthy();

        // the arrays should not be the same
        expect(mucatalogProfessorArray).not.toBe(mucoursesProfessorArray);
    });
});

describe('writing to database functions', () => {
    test('writeRMP', { timeout: 6_000_0000 }, async () => {
        await writeRMP();
    });
});
