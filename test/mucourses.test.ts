import { describe, expect, test } from 'vitest';
import {
    mucoursesData,
    getCourses,
    getCoursesByProfessor,
    getProfessorObjectiveMetrics,
    setProfessorObjectiveMetrics,
} from '../src/mucourses';
import {
    Professor,
    BasicInfo,
    ObjectiveMetrics,
    Name,
} from 'mizzoureview-reading';

describe.skip('API access', () => {
    test('getCourses defined', async () => {
        const data = await getCourses();
        expect(data).toBeDefined();
    });

    test('getCourses consistent object subset test ', async () => {
        const data: Object[] = await getCourses();

        const keySet = new Set();
        Object.keys(data[0]).forEach((key) => keySet.add(key));

        const dataSubset = data.slice(0, 100);
        dataSubset.forEach((datapoint: Object) => {
            Object.keys(datapoint).forEach((key) => {
                console.log(keySet);
                console.log(key);
                expect(keySet.has(key)).toBe(true);
            });
        });
        console.log(keySet);
    });
});
describe('API result handling', async () => {
    const allCourses = await getCourses();
    const professor = new Professor('00LOnCH6NUaxjSTq7JRk', {
        basicInfo: new BasicInfo(
            new Name('Mitchell', 'Goldman'),
            'Medicine-Infectious Diseases',
            { education: 'Doctor of Medicine' },
        ),
    });
    let objectiveMetrics: ObjectiveMetrics
    test('getCourses by instructor name, known', async () => {
        const name = new Name('Jill', 'Moreland', ['Annette']);
        const results: mucoursesData[] = getCoursesByProfessor(
            name,
            allCourses,
        );
        expect(results.length).toBeGreaterThan(0);
        //console.log(results)
    });
    test('Testing known professor', async () => {
        objectiveMetrics = getProfessorObjectiveMetrics(allCourses, professor);
        console.log(objectiveMetrics)
        expect(objectiveMetrics).toBeTruthy()
    });
    test('Testing correct setting', async ()=>{
        const professors = await setProfessorObjectiveMetrics([professor])
        professor.objectiveMetrics = objectiveMetrics

        const professorResult = professors[0]
        expect(professorResult).toEqual(professor)
        console.log(professorResult)
    })
});
