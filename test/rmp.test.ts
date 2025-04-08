import { beforeAll, describe, expect, test } from 'vitest';
import { getPage, fillProfName, fillSchool, sleep } from '../src/rmp';
import { Browser, Page } from 'playwright';

describe('reading a website!', () => {
    let browser: Browser;
    let page: Page;

    beforeAll(async () => {
        ({ browser, page } = await getPage());
    });

    test('page truthy', async () => {
        expect(page).toBeTruthy();
    });

    test('filling prof input', async () => {
        const profInputElem = await fillProfName(browser, page, 'Jim Ries');
        expect(profInputElem).toBeTruthy();
        await sleep(1);
    });

    test('filling school input', async () => {
        const schoolInputElem = await fillSchool(browser, page);
        expect(schoolInputElem).toBeTruthy();
        await sleep(3);
    });
});
