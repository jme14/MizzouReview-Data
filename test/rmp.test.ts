import { beforeAll, describe, expect, test } from 'vitest';
import {
    getPage,
    fillProfName,
    fillSchool,
    sleep,
    navigateToProfListPage,
    navigateToFirstProfPage,
    loadAllRatings,
    getAllComments,
    getExpectedRatings
} from '../src/rmp';
import { Browser, Page, Locator} from 'playwright';
import { Name } from 'mizzoureview-reading';

describe('reading a website!', () => {
    let browser: Browser;
    let page: Page;
    let profInputElem: Locator
    let schoolInputElem: Locator
    const testName = new Name("Michael", "Jurczyk")
    const expectedReviews = 42

    beforeAll(async () => {
        ({ browser, page } = await getPage());
    });

    test('page truthy', async () => {
        expect(page).toBeTruthy();
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
        const result = await navigateToProfListPage(browser, page, profInputElem)
        expect(result).toBeTruthy()
    });

    test('getting to prof page page', async () => {
        const name = new Name("Jim", "Ries")
        const jimrCount = await navigateToFirstProfPage(browser, page, testName)
        expect(jimrCount).toBeTruthy()
    })

    test('getting expected rating count', async() => {
        const result = await getExpectedRatings(browser,page)

        // this is a bad test lol 
        expect(result).toBe(expectedReviews)

    })
    test('trying to manipulate document such that all reviews are available', async() =>{
        const result = await loadAllRatings(browser, page)
        expect(result).toBeTruthy()
        const buttons = await page.getByText("Load More Ratings").all()
        expect(buttons.length).toBe(0)
    })

    test('trying to get all review objects', async ()=>{
        const result = await getAllComments(browser, page)
        expect(result).toBeTruthy()
        expect(result.length).toBeGreaterThan(0)
        expect(result.length).toBe(expectedReviews)
        result.forEach((res)=> console.log(res))
    })
});