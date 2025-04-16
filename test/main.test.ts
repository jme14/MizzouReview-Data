import { describe, expect, test } from 'vitest';
import { Name, Professor } from 'mizzoureview-reading';
import { BasicInfo } from 'mizzoureview-reading';
import { createProfessorsFromCatalog, updateMUCourses } from '../src/main';
import { TESTING, PROF_READ_LIMIT } from '../keys/config.json';

describe('professor object management', async () => {
    let mucatalogProfessorArray: Professor[]
    let mucoursesProfessorArray: Professor[]

    test('createProfessorsFromCatalog()', async () => {
        mucatalogProfessorArray = await createProfessorsFromCatalog();
        expect(mucatalogProfessorArray).toBeTruthy();
        expect(mucatalogProfessorArray.length).toBeGreaterThan(0)
    });

    test('updateMUCourses()', async() => {
        mucoursesProfessorArray = mucatalogProfessorArray

        // deep copy to keep track of how array has changed
        mucatalogProfessorArray = mucatalogProfessorArray.map((prof) => ({...prof}))

        const mucoursesSuccess = await updateMUCourses(mucoursesProfessorArray)

        // no elements should be lost 
        expect(mucoursesSuccess).toBeTruthy()

        // the arrays should not be the same
        expect(mucatalogProfessorArray).not.toBe(mucoursesProfessorArray)
    })

});
