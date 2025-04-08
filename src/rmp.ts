import { Browser, chromium, Page, Locator } from 'playwright';
import { OperationCanceledException } from 'typescript';

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
export async function fillProfName(browser: Browser, page: Page, name: string) {
    const inputElements = page
        .getByPlaceholder('Professor name')
        .filter({ visible: true });
    const totalInputs = await inputElements.all();
    if (totalInputs.length > 1) {
        throw new OperationCanceledException();
    }
    await inputElements.fill(name);
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
    name: string,
) {
    const nameregex = new RegExp(name.replace(/\s+/g, '\\s+'));

    // this provides two elements 
    const allNameElements = await page
        .getByText(nameregex)
        .all();

    const initialURL = page.url()
    for (let i = 0 ; i < allNameElements.length ; i++){
        await allNameElements.at(i)?.click()
        const finalURL = page.url()
        if (initialURL != finalURL){
            return true
        }
    }
    return false
}
export async function readWebsite() {
    const { browser, page } = await getPage();

    const profInputElem = await fillProfName(browser, page, 'Jim Ries');
    const schoolInputElem = await fillSchool(browser, page);
    await schoolInputElem.focus();
    await page.keyboard.press('Enter');

    /* 
    console.log("Filled in data!")
    await page.keyboard.press("Enter")
    console.log("Pressed enter!")
    const jimThings = page.getByText("Jim Ries")
    const jimThingsCount = await jimThings.count() 
    console.log(`jimThingsCount is ${jimThingsCount}`)
    let realJimThing
    for ( let i = 0 ; i < jimThingsCount ; i++){
        const currentJim = jimThings.nth(i)
        const jimText = await currentJim.textContent()
        if (!jimText){
            continue
        }
        if (jimText.includes("\"")){
            realJimThing = currentJim
            break
        }
    }
    if (realJimThing === undefined){
        return false
    }
    await realJimThing.click()
    
    // console.log(page)
    await browser.close()
    console.log("We are finished!")
    return true
    */
}
