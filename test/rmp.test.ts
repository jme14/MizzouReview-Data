import { beforeAll, afterAll, describe, expect, test } from 'vitest';
import {
    getPage,
    fillProfName,
    fillSchool,
    navigateToProfListPage,
    navigateToFirstProfPage,
    loadAllRatings,
    getAllComments,
    getExpectedRatings,
    RatingData,
    getSubjectiveMetrics,
    getQuality,
    getDifficulty,
    getTextbook,
    getAttendance,
    getGradingIntensity,
    getPolarization,
    getSubjectiveMetricsFromProfessor,
    goToRMPStart,
} from '../src/collection/rmp';
import { Browser, Page, Locator } from 'playwright';
import { Name } from 'mizzoureview-reading/models/name';

describe('parts', () => {
    const testName = new Name('Chip', 'Gubera');
    const expectedReviews = 24;
    let browser: Browser;
    let page: Page;
    let profInputElem: Locator;
    let schoolInputElem: Locator;
    let ratingData: RatingData[];

    beforeAll(async () => {
        ({ browser, page } = await getPage({ headless: false }));
    });

    afterAll(async () => {
        await browser.close();
        console.log('Closed this browser!');
    });

    test('page truthy', async () => {
        expect(page).toBeTruthy();
    });
    test('going to proper page', async () => {
        await goToRMPStart(browser, page);
        expect(page.url()).toBe(
            'https://www.ratemyprofessors.com/search/professors/',
        );
    });
    test('filling prof input', async () => {
        profInputElem = await fillProfName(browser, page, testName);
        expect(profInputElem).toBeTruthy();
    });

    test('filling school input', async () => {
        schoolInputElem = await fillSchool(browser, page);
        expect(schoolInputElem).toBeTruthy();
    });

    test('navigating to prof list page', async () => {
        const result = await navigateToProfListPage(
            browser,
            page,
            profInputElem,
        );
        expect(result).toBeTruthy();
    });

    test('getting to prof page page', async () => {
        const jimrCount = await navigateToFirstProfPage(
            browser,
            page,
            testName,
        );
        expect(jimrCount).toBeTruthy();
    });

    test('getting expected rating count', async () => {
        const result = await getExpectedRatings(browser, page);

        // this is a bad test lol
        expect(result).toBe(expectedReviews);
    });
    test('trying to manipulate document such that all reviews are available', async () => {
        const result = await loadAllRatings(browser, page);
        expect(result).toBeTruthy();
        const buttons = await page.getByText('Load More Ratings').all();
        expect(buttons.length).toBe(0);
    });

    //this test makes sure that the total amount of reviews listed at the top of the page match the amount of review objects gathered
    test('trying to get all review objects', async () => {
        const result = await getAllComments(browser, page);
        expect(result).toBeTruthy();
        expect(result.length).toBeGreaterThan(0);
        expect(result.length).toBe(expectedReviews);
        ratingData = result;
    });

    test('unit tests for each metric, followed by getting subjective metric', async () => {
        const metrics = ratingData;

        const quality = getQuality(metrics);
        expect(quality).toBeGreaterThanOrEqual(0);
        expect(quality).toBeLessThanOrEqual(10);
        const difficulty = getDifficulty(metrics);
        expect(difficulty).toBeGreaterThanOrEqual(0);
        expect(difficulty).toBeLessThanOrEqual(10);
        const gradingIntensity = getGradingIntensity(metrics);
        expect(gradingIntensity).toBeGreaterThanOrEqual(0);
        expect(gradingIntensity).toBeLessThanOrEqual(10);
        const attendance = getAttendance(metrics);
        expect(attendance).toBeGreaterThanOrEqual(0);
        expect(attendance).toBeLessThanOrEqual(10);
        const textbook = getTextbook(metrics);
        expect(textbook).toBeGreaterThanOrEqual(0);
        expect(textbook).toBeLessThanOrEqual(10);
        const polarization = getPolarization(metrics);
        expect(polarization).toBeGreaterThanOrEqual(0);
        expect(polarization).toBeLessThanOrEqual(10);

        const subjectiveMetrics = getSubjectiveMetrics(ratingData);
        expect(subjectiveMetrics).toBeTruthy;
        console.log(subjectiveMetrics);
    });
});
describe('one', () => {
    let browser: Browser;
    let page: Page;

    beforeAll(async () => {
        ({ browser, page } = await getPage());
    });

    afterAll(async () => {
        await browser.close();
    });
    test('testing main good', async () => {
        const subjectiveMetrics = await getSubjectiveMetricsFromProfessor(
            browser,
            page,
            new Name('Gary', 'McKenzie'),
        );
        expect(subjectiveMetrics).toBeTruthy();
        console.log(subjectiveMetrics);
    });
    test('testing main bad', async () => {
        const subjectiveMetrics = await getSubjectiveMetricsFromProfessor(
            browser,
            page,
            new Name('Makayla', 'Morton'),
        );
        expect(subjectiveMetrics).toBeFalsy();
        console.log(subjectiveMetrics);
    });
});

describe('many', () => {
    let browser: Browser;
    let page: Page;
    const namesArray = [
        new Name('Gary', 'McKenzie'),
        new Name('Troy', 'Hall'),
        new Name('Jim', 'Ries'),
        new Name('Michael', 'Jurczyk'),
        new Name('Fang', 'Wang'),
        new Name('Denice', 'Adkins'),
        new Name('James', 'Crozier'),
        new Name('Brian', 'Ganley'),
    ];
    const profMap = new Map();

    beforeAll(async () => {
        ({ browser, page } = await getPage());
        console.log('Browser initialized');
    });

    afterAll(async () => {
        console.log(profMap);
        await browser.close();
    });
    test('prof1', async () => {
        const subjectiveMetrics = await getSubjectiveMetricsFromProfessor(
            browser,
            page,
            namesArray[0],
        );
        expect(subjectiveMetrics).toBeTruthy();
        console.log(subjectiveMetrics);
        profMap.set(namesArray[0], subjectiveMetrics);
    });
    test('prof2', async () => {
        const subjectiveMetrics = await getSubjectiveMetricsFromProfessor(
            browser,
            page,
            namesArray[1],
        );
        expect(subjectiveMetrics).toBeTruthy();
        console.log(subjectiveMetrics);
        profMap.set(namesArray[1], subjectiveMetrics);
    });
    test('prof3 thru prof4', async () => {
        const subjectiveMetrics3 = await getSubjectiveMetricsFromProfessor(
            browser,
            page,
            namesArray[2],
        );
        expect(subjectiveMetrics3).toBeTruthy();
        console.log(subjectiveMetrics3);
        profMap.set(namesArray[2], subjectiveMetrics3);
        const subjectiveMetrics4 = await getSubjectiveMetricsFromProfessor(
            browser,
            page,
            namesArray[3],
        );
        expect(subjectiveMetrics4).toBeTruthy();
        console.log(subjectiveMetrics4);
        profMap.set(namesArray[3], subjectiveMetrics4);
    });
    test('the rest', async () => {
        for (let i = 4; i < namesArray.length; i++) {
            const subjectiveMetrics = await getSubjectiveMetricsFromProfessor(
                browser,
                page,
                namesArray[i],
            );
            expect(subjectiveMetrics).toBeTruthy();
            console.log(subjectiveMetrics);
            profMap.set(namesArray[i], subjectiveMetrics);
        }
    });
});
