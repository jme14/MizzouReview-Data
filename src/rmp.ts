import { Browser, chromium, Page, Locator } from 'playwright';
import { OperationCanceledException } from 'typescript';
import { Name } from 'mizzoureview-reading';

export class RatingData{
    quality: number;
    difficulty: number;
    comment: string;
    tags: string[];
    upvotes: number;
    downvotes: number;
    constructor(textArray: string[]){
        this.quality = parseFloat(textArray[1])
        this.difficulty = parseFloat(textArray[3])
        // imperfect solution
        let commentIndex = textArray.findIndex((string) => string.includes("Textbook:"))+1

        // thank you stackoverflow.com/questions/6521245/finding-longest-string-in-array
        if (commentIndex == 0) {
            this.comment = textArray.reduce((el1, el2) => {
                return el1.length > el2.length ? el1 : el2;
            });
        } else{
            this.comment = textArray[commentIndex] 
        }
        this.tags = textArray.filter((str) => str.toUpperCase() == str && str != "QUALITY" && str != "DIFFICULTY" )
        this.tags = this.tags.filter((str) => !str.match(/\d+/g) )
        this.upvotes = parseInt(textArray[textArray.length-2])
        this.downvotes = parseInt(textArray[textArray.length-1])
    }
}
export async function sleep(seconds: number) {
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}
// go to RMP
export async function getPage() {
    // const browser = await chromium.launch({ headless: false });
    const browser = await chromium.launch()
    const page = await browser.newPage();
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
    return false
}

// the page must be navigated to the professor page. This makes functional bros cry. 
export async function getExpectedRatings(browser: Browser, page: Page){
    const elem = page.getByRole("link").filter({hasText: " ratings"})
    const innerHTML = await elem.innerHTML()
    const num = innerHTML.split("&")[0]
    return parseInt(num)
}
export async function loadAllRatings(browser: Browser, page: Page){
    const listItemsLocator = page.getByRole("listitem").filter({hasText: "QUALITY"})
    const expectedListCount = await getExpectedRatings(browser, page)
    let currentListCount = await listItemsLocator.count()
    
    // this is a bug I can't fix rn I can't bear it i just cant take it anymore im so sleepy please dear god someone send some help send someone to do this for me please PLEASElol 
    while (currentListCount < expectedListCount){

        let button = page.getByText("Load More Ratings")
        try{
            await button.waitFor({state:'visible', timeout:2000} )
        } catch(e){
            break
        }

        await button.focus()
        await button.click()
        // wait for new stuff to get added 
        await listItemsLocator.first().waitFor({state:'attached'})
        currentListCount = await listItemsLocator.count()
    }
    return true
}

export async function getAllComments(browser: Browser, page: Page): Promise<RatingData[]>{
    await page.waitForLoadState('load');

    const listItems = page.getByRole("listitem")
    const listItemsCount = await listItems.count()
    if (listItemsCount == 0){
        return getAllComments(browser, page) 
    }

    // array of arrays
    const allResponses = []
    

    for ( let i = 0 ; i < listItemsCount ; i++){
        const allText = await listItems.nth(i).allInnerTexts()
        const textArray = allText[0].split("\n")

        if (textArray[0].length == 0){
            continue
        }
        if (textArray[0] == 'QUALITY'){
            console.log(textArray)
            allResponses.push(new RatingData(textArray))
        }
    }

    return allResponses;
}

export function getDifficulty(metrics: RatingData[]){
    let totalDifficulty = 0
    let totalWeight = 0
    for ( let i = 0 ; i < metrics.length ; i++){
        const unweightedDifficulty = metrics[i].difficulty
        if (metrics[i].downvotes > metrics[i].upvotes){
            totalDifficulty = totalDifficulty + unweightedDifficulty/2
            totalWeight = totalWeight + 0.5
        } else {
            totalDifficulty = totalDifficulty + unweightedDifficulty
            totalWeight = 1
        }
    }
    try{
        return totalDifficulty/totalWeight
    } catch(e){
        return 0
    }
}
export function getQuality(metrics: RatingData[]){
    let totalDifficulty = 0
    let totalWeight = 0
    for ( let i = 0 ; i < metrics.length ; i++){
        const unweightedDifficulty = metrics[i].quality
        if (metrics[i].downvotes > metrics[i].upvotes){
            totalDifficulty = totalDifficulty + unweightedDifficulty/2
            totalWeight = totalWeight + 0.5
        } else {
            totalDifficulty = totalDifficulty + unweightedDifficulty
            totalWeight = 1
        }
    }
    try{
        return totalDifficulty/totalWeight
    } catch(e){
        return 0
    }
}
export function getRatingTagMap(metrics: RatingData[]): Map<string, number>{
    // map of tags 
    let tags = new Map()
    for ( let i = 0 ; i < metrics.length ; i++){
        const metricTags = metrics[i].tags
        metricTags.forEach((tag) => {
            if (!tags.get(tag)){
                tags.set(tag,1)
            } else {
                tags.set(tag, tags.get(tag)+1)
            }
        })
    }
    return tags
}
export function getGradingIntensity(metrics: RatingData[]){
    const tagMap = getRatingTagMap(metrics)
    const toughGraderCount = tagMap.get("TOUGH GRADER")
    const ratingCount = metrics.length
    const percentRatingsContainToughGrader = (toughGraderCount || 0)/ratingCount

    // this needs to be discussed/observed: need to figure out what percentage warrents the tough grader metric 
    // for now: 
    // 0-9%: 1/5 (20%)
    // 10-19%: 2/5 (40%)
    // ...
    // 40-100%: 5/5
    if (percentRatingsContainToughGrader >= 0.4){
        return 5
    } else if (percentRatingsContainToughGrader == 0){
        return 1
    } else{
        return Math.ceil(percentRatingsContainToughGrader*10)
    }

}
export function getMetrics(metrics: RatingData[]){
}