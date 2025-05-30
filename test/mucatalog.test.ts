import { describe, expect, test } from 'vitest';
import { BasicInfo } from 'mizzoureview-reading/models/professor';
import { getProfessorBasicInfo } from '../src/collection/mucatalog';

describe('getProfessorBasicInfo', async () => {
    let bI: BasicInfo[];

    test('Truthy', async () => {
        bI = await getProfessorBasicInfo();
        console.log(bI);
        expect(bI).toBeTruthy();
    });
    test('Not length 0', () => {
        expect(bI.length).toBeGreaterThan(0);
    });
    test('Length reasonable guess', () => {
        expect(bI.length).toBeGreaterThan(300);
    });
    test('Basic info not formatted stupid', () => {
        bI.forEach((basicInfo) => {
            expect(basicInfo.department.trim()).toBe(basicInfo.department);
            expect(basicInfo.education?.trim()).toBe(basicInfo.education);
            expect(basicInfo.title?.trim()).toBe(basicInfo.title);
        });
    });
});
