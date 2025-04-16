import { describe, expect, test } from 'vitest';
import {
    getCourseArray,
    mucoursesData,
    getCoursesByProfessor,
    getProfessorObjectiveMetrics,
    setProfessorObjectiveMetrics,
    getProfessorCourseMapFromCourseArray,
    getProfessorCourseMap,
} from '../src/mucourses';
import {
    Professor,
    BasicInfo,
    ObjectiveMetrics,
    Name,
} from 'mizzoureview-reading';

describe('API access and getting the map', () => {
    let data: mucoursesData[] = [];
    let courseMap: Map<string, mucoursesData[]>;
    test('getCourseArray defined', async () => {
        data = await getCourseArray();
        expect(data).toBeDefined();
    });

    test('getCourses consistent object subset test ', async () => {
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
    test('get professor/courses map', () => {
        const professorCourseMap = getProfessorCourseMapFromCourseArray(data);
        expect(professorCourseMap).toBeTruthy();
        expect(professorCourseMap.size).toBeGreaterThanOrEqual(1000);
        courseMap = professorCourseMap;
    });
    test('courseMap has valid data', () => {
        let maxName: string;
        let maxLength = 0;
        for (const [name, arr] of courseMap) {
            if (arr.length > maxLength) {
                maxLength = arr.length;
                maxName = name;
            }
        }
        expect(maxLength).toBeGreaterThan(1);
        expect(maxLength).toBeGreaterThan(20);
    });
});
describe('API result handling', async () => {
    const professorCourseMap = await getProfessorCourseMap();

    const professor = new Professor('blah', {
        basicInfo: new BasicInfo(
            new Name('James', 'Ries'),
            'Electrical Eng & Computer Sci',
            { education: 'Master of Science' },
        ),
    });

    let objectiveMetrics: ObjectiveMetrics;

    test('getCourses by instructor name, known', async () => {
        const name = new Name('Jill', 'Moreland', ['Annette']);
        const results: mucoursesData[] = getCoursesByProfessor(
            name,
            professorCourseMap,
        );
        expect(results.length).toBeGreaterThan(0);
        //console.log(results)
    });
    test('Testing known professor', async () => {
        objectiveMetrics = getProfessorObjectiveMetrics(
            professorCourseMap,
            professor,
        );
        console.log(objectiveMetrics);
        expect(objectiveMetrics).toBeTruthy();
    });
    test('Testing correct setting', async () => {
        const professors = await setProfessorObjectiveMetrics([professor]);
        professor.objectiveMetrics = objectiveMetrics;

        const professorResult = professors[0];
        expect(professorResult).toEqual(professor);
        console.log(professorResult);
    });
});
