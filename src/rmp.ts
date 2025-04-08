import { Browser, chromium, Page, Locator } from 'playwright';
import { OperationCanceledException } from 'typescript';
import { Name } from 'mizzoureview-reading';

export async function sleep(seconds: number) {
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}
// go to RMP
export async function getPage() {
    const browser = await chromium.launch({ headless: false });
    // const browser = await chromium.launch()
    const page = await browser.newPage();
    console.log('Awaiting page load');
    // await page.goto("https://www.ratemyprofessors.com/search/professors/", {waitUntil:"load", timeout:0})
    await page.goto('https://www.ratemyprofessors.com/search/professors/', {
        waitUntil: 'domcontentloaded',
    });
    return { browser, page };
}
// fill the Professor search item
export async function fillProfName(browser: Browser, page: Page, name: Name) {
    const inputElements = page
        .getByPlaceholder('Professor name')
        .filter({ visible: true });
    const totalInputs = await inputElements.all();
    if (totalInputs.length > 1) {
        throw new OperationCanceledException();
    }
    await inputElements.fill(name.toString());
    return inputElements;
}
// fill the school search item
export async function fillSchool(browser: Browser, page: Page) {
    const inputElements = page
        .getByPlaceholder('Your school')
        .filter({ visible: true });
    const totalInputs = await inputElements.all();
    if (totalInputs.length > 1) {
        throw new OperationCanceledException();
    }
    await inputElements.fill('University of Missouri - Columbia');
    return inputElements;
}
export async function navigateToProfListPage(
    browser: Browser,
    page: Page,
    inputElem: Locator,
) {
    const beforeURL = page.url();
    await inputElem.focus();
    await page.keyboard.press('Enter');
    const afterURL = page.url();
    if (beforeURL == afterURL) {
        return false;
    }
    return true;
}

export async function navigateToFirstProfPage(
    browser: Browser,
    page: Page,
    name: Name,
) {
    const nameregex = new RegExp(name.toString().replace(/\s+/g, '\\s+'));

    console.log(nameregex) 
    // this provides two elements 

    await page.waitForLoadState('load')
    const allNameElements = await page
        .getByText(nameregex)
        .all();

    const initialURL = page.url()
    console.log(allNameElements.length)
    for (let i = 0 ; i < allNameElements.length ; i++){
        console.log(i)
        await allNameElements.at(i)?.click()
        await page.waitForLoadState('load')
        const finalURL = page.url()
        if (initialURL != finalURL){
            console.log(`${initialURL} vs ${finalURL}`)
            return true
        }
    }
    console.log("FALSE!")
    return false
}

export async function loadAllRatings(browser: Browser, page: Page){
    await page.waitForLoadState('load')
    let counter = 0
    while (await page.getByText("Load More Ratings").isVisible()){
        console.log(`This is run ${counter}`)
        counter = counter+1
        let button = page.getByText("Load More Ratings").filter({visible:true})
        console.log("Clicking the button!")
        console.log(page.getByText("Load More Ratings").isVisible())

        await button.focus()
        await button.click()
        await page.waitForLoadState('load')
    }

    return true
}
