import { beforeAll, describe, expect, test } from 'vitest';
import {
    getPage,
    fillProfName,
    fillSchool,
    sleep,
    navigateToProfListPage,
    navigateToFirstProfPage 
} from '../src/rmp';
import { Browser, Page, Locator} from 'playwright';

describe('reading a website!', () => {
    let browser: Browser;
    let page: Page;
    let profInputElem: Locator
    let schoolInputElem: Locator

    beforeAll(async () => {
        ({ browser, page } = await getPage());
    });

    test('page truthy', async () => {
        expect(page).toBeTruthy();
    });

    test('filling prof input', async () => {
        profInputElem = await fillProfName(browser, page, 'Jim Ries');
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

    test('seeing how many jimrs there are', async () => {
        await sleep(1)
        const jimrCount = await navigateToFirstProfPage(browser, page, "Jim Ries")
        expect(jimrCount).toBeTruthy
    })
});