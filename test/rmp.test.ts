import { beforeAll, describe, expect, test } from 'vitest';
import {
    getPage,
    fillProfName,
    fillSchool,
    sleep,
    navigateToProfListPage,
    navigateToFirstProfPage,
    loadAllRatings
} from '../src/rmp';
import { Browser, Page, Locator} from 'playwright';
import { Name } from 'mizzoureview-reading';

describe('reading a website!', () => {
    let browser: Browser;
    let page: Page;
    let profInputElem: Locator
    let schoolInputElem: Locator
    const testName = new Name("Dale", "Musser")

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

    test('getting to jimr page', async () => {
        const name = new Name("Jim", "Ries")
        const jimrCount = await navigateToFirstProfPage(browser, page, testName)
        expect(jimrCount).toBeTruthy()
    })

    test('trying to load all ratings', async() =>{
        const result = await loadAllRatings(browser, page)
        expect(result).toBeTruthy()
        const buttons = await page.getByText("Load More Ratings").all()
        expect(buttons.length).toBe(0)
    })
});