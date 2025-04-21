import { describe, test, expect } from 'vitest';
import {
    getStringArrayMetrics,
    getNumberArrayMetrics,
    getDatabaseMetrics,
} from '../src/database/reader';

import { Firestore } from 'firebase-admin/firestore';
import { initializeDatabase } from '../src/database/initializer';

describe.skip('histogram printing', () => {
    const stringArray = [
        'Hi',
        'My',
        'My',
        'My',
        'My',
        undefined,
        'Twelve',
        'Twelve',
    ];

    const numberArray = [
        undefined,
        undefined,
        undefined,
        3,
        6,
        1,
        3,
        undefined,
        6,
        6,
        undefined,
        undefined,
    ];
    test('string histogram', () => {
        getStringArrayMetrics(stringArray);
    });

    test('number histogram', () => {
        getNumberArrayMetrics(numberArray, 0, 10, 0);
    });
});

describe('actual printing of metrics', () => {
    test('here goes nothing', async () => {
        const db: Firestore = initializeDatabase();
        await getDatabaseMetrics(db);
    });
});
