import { Browser, chromium, Page, Locator } from 'playwright';
import { OperationCanceledException } from 'typescript';
// import { Professor, Name, BasicInfo, SubjectiveMetrics } from 'mizzoureview-reading';
import cliProgress from 'cli-progress';
import {
    AIPromptAnswers,
    Professor,
    SubjectiveMetrics,
} from 'mizzoureview-reading/models/professor';

import { Name } from 'mizzoureview-reading/models/name';
import { generateStudentLetter } from '../helpers/gemini.js';
import { generateProfessorLetter } from '../helpers/gemini.js';

import { config } from 'dotenv';
config();
const RMP_ARRAY_LIMIT = Number(process.env.RMP_ARRAY_LIMIT);

export class RatingData {
    quality: number; // the number from the review
    difficulty: number; // the number from the review
    comment: string; // the words from the review
    tags: string[]; // the list of tags from the review
    upvotes: number; // upvote count
    downvotes: number; // downvote count
    attendance?: boolean; // undefined if not described, true if mandatory, false if not mandatory
    textbook?: boolean; // undefined if not described, true if mandatory, false if not mandatory

    constructor(textArray: string[]) {
        this.quality = parseFloat(textArray[1]);
        this.difficulty = parseFloat(textArray[3]);
        // imperfect solution
        let commentIndex =
            textArray.findIndex((string) => string.includes('Textbook: ')) + 1;

        // thank you stackoverflow.com/questions/6521245/finding-longest-string-in-array
        if (commentIndex == 0) {
            this.comment = textArray.reduce((el1, el2) => {
                return el1.length > el2.length ? el1 : el2;
            });
        } else {
            this.comment = textArray[commentIndex];
        }
        this.tags = textArray.filter(
            (str) =>
                str.toUpperCase() == str &&
                str != 'QUALITY' &&
                str != 'DIFFICULTY',
        );
        this.tags = this.tags.filter((str) => !str.match(/\d+/g));
        this.upvotes = parseInt(textArray[textArray.length - 2]);
        this.downvotes = parseInt(textArray[textArray.length - 1]);
        const textbookIndex = textArray.findIndex((string) =>
            string.includes('Textbook: '),
        );
        if (textbookIndex != -1) {
            // this is god awful
            this.textbook =
                textArray[textbookIndex].split(' ')[1] == 'Yes' ? true : false;
        }
        const attendanceIndex = textArray.findIndex((string) =>
            string.includes('Attendance: '),
        );
        if (attendanceIndex != -1) {
            // this is too
            this.attendance =
                textArray[attendanceIndex].split(' ')[1] == 'Mandatory'
                    ? true
                    : false;
        }
    }
}
export async function sleep(seconds: number) {
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}
// go to RMP
export async function getPage(options?: { headless: boolean }) {
    if (!options) {
        options = { headless: true };
    }
    const browser = await chromium.launch(options);
    const page = await browser.newPage();
    // await page.goto("https://www.ratemyprofessors.com/search/professors/", {waitUntil:"load", timeout:0})
    // await goToRMPStart(browser, page)
    return { browser, page };
}
export async function goToRMPStart(browser: Browser, page: Page) {
    await page.goto('https://www.ratemyprofessors.com/search/professors/', {
        waitUntil: 'domcontentloaded',
    });
    // console.log('Navigation to start successful');
}
export async function urlValid(
    browser: Browser,
    page: Page,
    urlContains: RegExp,
) {
    const URL = page.url();
    if (!URL.match(urlContains)) {
        return false;
    }
    return true;
}
// fill the Professor search item
export async function fillProfName(browser: Browser, page: Page, name: Name) {
    if (!urlValid(browser, page, new RegExp('/search/professors/'))) {
        throw new Error('Function called when page not correct');
    }
    const inputElements = page.getByPlaceholder('Professor name').filter({
        visible: true,
    });
    const totalInputs = await inputElements.all();
    if (totalInputs.length > 1) {
        throw new OperationCanceledException();
    }
    await inputElements.clear();
    await inputElements.fill(name.toString());
    // console.log('Filling professor name successful');
    return inputElements;
}
// fill the school search item
export async function fillSchool(browser: Browser, page: Page) {
    if (!urlValid(browser, page, new RegExp('/search/professors/'))) {
        throw new Error('Function called when page not correct');
    }
    const inputElements = page.getByPlaceholder('Your school').filter({
        visible: true,
    });
    const totalInputs = await inputElements.all();
    if (totalInputs.length > 1) {
        throw new OperationCanceledException();
    }
    if (totalInputs.length == 0) {
        return inputElements;
    }
    const inputElementsContent = await inputElements.textContent();

    // if the content contain the university already, move on
    if (inputElementsContent?.includes('University of Missouri - Columbia')) {
        return inputElements;
    }

    await inputElements.fill('University of Missouri - Columbia');
    // console.log('Filling school name successful');
    await page
        .locator(
            '[aria-label="School page for University of Missouri - Columbia"]',
        )
        .click();

    return inputElements;
}
export async function navigateToProfListPage(
    browser: Browser,
    page: Page,
    inputElem: Locator,
) {
    if (!urlValid(browser, page, new RegExp('/search/professors/'))) {
        throw new Error('Function called when page not correct');
    }
    const beforeURL = page.url();
    await inputElem.focus();
    await page.keyboard.press('Enter');
    const afterURL = page.url();
    if (beforeURL == afterURL) {
        // console.log('Navigating to prof list page failure');
        return false;
    }
    // console.log('Navigating to prof list page successful');
    return true;
}

export async function navigateToFirstProfPage(
    browser: Browser,
    page: Page,
    name: Name,
) {
    if (!urlValid(browser, page, new RegExp('/search/professors/'))) {
        throw new Error('Function called when page not correct');
    }
    const nameregex = new RegExp(name.toString().replace(/\s+/g, '\\s+'));

    // this provides two elements
    await page.waitForLoadState('load');
    let allNameElements = await page.getByText(nameregex).all();

    // this fails sometimes, and this might fix it
    let retryCounter = 0;
    while (allNameElements.length == 0) {
        await sleep(1);
        allNameElements = await page.getByText(nameregex).all();
        retryCounter++;
        if (retryCounter == 5) {
            throw new Error('Failed to navigate to first prof page by name');
        }
    }

    const initialURL = page.url();
    for (let i = 0; i < allNameElements.length; i++) {
        await allNameElements.at(i)?.click({ timeout: 3000 });
        await page.waitForLoadState('load');
        const finalURL = page.url();
        if (initialURL != finalURL) {
            // console.log('Navigating to first prof page success');
            return true;
        }
    }
    // console.log(allNameElements);
    // console.log('Navigating to first prof page failure');
    return false;
}

// the page must be navigated to the professor page. This makes functional bros cry.
export async function getExpectedRatings(browser: Browser, page: Page) {
    if (!urlValid(browser, page, /professor\/\d+/)) {
        throw new Error('Function called when page not correct');
    }
    const elem = page.getByRole('link').filter({
        hasText: /^\d+\s+ratings$/,
    });

    try {
        const innerHTML = await elem.innerHTML();
        const num = innerHTML.split('&')[0];
        return parseInt(num);
    } catch (err) {
        console.log(err);
        return -1;
    }
}
export async function loadAllRatings(browser: Browser, page: Page) {
    if (!urlValid(browser, page, /professor\/\d+/)) {
        throw new Error('Function called when page not correct');
    }
    const listItemsLocator = page.getByRole('listitem').filter({
        hasText: 'QUALITY',
    });
    const expectedListCount = await getExpectedRatings(browser, page);
    if (expectedListCount == -1) {
        throw Error('Invalid expected list count');
    }
    let currentListCount = await listItemsLocator.count();

    // this is a bug I can't fix rn I can't bear it i just cant take it anymore im so sleepy please dear god someone send some help send someone to do this for me please PLEASElol
    while (currentListCount < expectedListCount) {
        let button = page.getByText('Load More Ratings');
        try {
            await button.waitFor({
                state: 'visible',
                timeout: 2000,
            });
        } catch (e) {
            break;
        }

        await button.focus();
        await button.click();
        // wait for new stuff to get added
        await listItemsLocator.first().waitFor({
            state: 'attached',
        });
        currentListCount = await listItemsLocator.count();
    }
    // console.log('Ratings loading successful');
    return true;
}

export async function getAllComments(
    browser: Browser,
    page: Page,
): Promise<RatingData[]> {
    if (!urlValid(browser, page, /professor\/\d+/)) {
        throw new Error('Function called when page not correct');
    }
    await page.waitForLoadState('load');

    const listItems = page.getByRole('listitem');
    const listItemsCount = await listItems.count();
    if (listItemsCount == 0) {
        return getAllComments(browser, page);
    }

    // array of arrays
    const allResponses = [];

    for (let i = 0; i < listItemsCount; i++) {
        const allText = await listItems.nth(i).allInnerTexts();
        const textArray = allText[0].split('\n');

        if (textArray[0].length == 0) {
            continue;
        }
        if (textArray[0] == 'QUALITY') {
            allResponses.push(new RatingData(textArray));
        }
    }

    // console.log('Comment reading successful');
    return allResponses;
}

export function getDifficulty(metrics: RatingData[]) {
    let totalDifficulty = 0;
    let totalWeight = 0;
    for (let i = 0; i < metrics.length; i++) {
        const unweightedDifficulty = metrics[i].difficulty;
        if (metrics[i].downvotes > metrics[i].upvotes) {
            totalDifficulty = totalDifficulty + unweightedDifficulty / 2;
            totalWeight = totalWeight + 0.5;
        } else {
            totalDifficulty = totalDifficulty + unweightedDifficulty;
            totalWeight = totalWeight + 1;
        }
    }
    try {
        return (totalDifficulty / totalWeight) * 2;
    } catch (e) {
        return 0;
    }
}
export function getQuality(metrics: RatingData[]) {
    let totalDifficulty = 0;
    let totalWeight = 0;
    for (let i = 0; i < metrics.length; i++) {
        const unweightedDifficulty = metrics[i].quality;
        if (metrics[i].downvotes > metrics[i].upvotes) {
            totalDifficulty = totalDifficulty + unweightedDifficulty / 2;
            totalWeight = totalWeight + 0.5;
        } else {
            totalDifficulty = totalDifficulty + unweightedDifficulty;
            totalWeight = totalWeight + 1;
        }
    }
    try {
        return (totalDifficulty / totalWeight) * 2;
    } catch (e) {
        return 0;
    }
}
export function getRatingTagMap(metrics: RatingData[]): Map<string, number> {
    // map of tags
    let tags = new Map();
    for (let i = 0; i < metrics.length; i++) {
        const metricTags = metrics[i].tags;
        metricTags.forEach((tag) => {
            if (!tags.get(tag)) {
                tags.set(tag, 1);
            } else {
                tags.set(tag, tags.get(tag) + 1);
            }
        });
    }
    return tags;
}
export function getGradingIntensity(metrics: RatingData[]) {
    const tagMap = getRatingTagMap(metrics);
    const toughGraderCount = tagMap.get('TOUGH GRADER');
    const ratingCount = metrics.length;
    const percentRatingsContainToughGrader =
        (toughGraderCount || 0) / ratingCount;

    return percentRatingsContainToughGrader * 10;
}
export function getAttendance(metrics: RatingData[]) {
    let attendanceWriterCount = metrics.length;
    let attendanceRequired = 0;
    metrics.forEach((metric) => {
        if (metric.attendance == undefined) {
            attendanceWriterCount--;
        } else if (metric.attendance) {
            attendanceRequired++;
        }
    });

    const attendanceRequiredPercentage =
        attendanceRequired / attendanceWriterCount;
    return attendanceRequiredPercentage * 10;
}
export function getTextbook(metrics: RatingData[]) {
    let textbookWriterCount = metrics.length;
    let textbookRequired = 0;
    metrics.forEach((metric) => {
        if (metric.textbook == undefined) {
            textbookWriterCount--;
        } else if (metric.textbook) {
            textbookRequired++;
        }
    });

    const textbookRequiredPercentage = textbookRequired / textbookWriterCount;
    return textbookRequiredPercentage * 10;
}
export function getPolarization(metrics: RatingData[]) {
    const numbers = metrics.map((metric) => metric.quality);

    // this is straight from chatgpt sorry yall
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const variance =
        numbers.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
        numbers.length;
    // this is a range between 0 and 2, so...
    const standarddeviation = Math.sqrt(variance);

    return standarddeviation * 5;
}

export async function getProfLetter(metrics: RatingData[]) {
    const comments = metrics.map((metric) => metric.comment);

    const profLetter = await generateProfessorLetter(comments);

    return profLetter;
}

export async function getStudentLetter(metrics: RatingData[]) {
    const comments = metrics.map((metric) => metric.comment);

    const studentLetter = await generateStudentLetter(comments);

    return studentLetter;
}

export function getSubjectiveMetrics(metrics: RatingData[]): SubjectiveMetrics {
    const quality = getQuality(metrics);
    const difficulty = getDifficulty(metrics);
    const gradingIntensity = getGradingIntensity(metrics);
    const attendance = getAttendance(metrics);
    const textbook = getTextbook(metrics);
    const polarization = getPolarization(metrics);

    return new SubjectiveMetrics({
        quality: quality,
        difficulty: difficulty,
        gradingIntensity: gradingIntensity,
        attendance: attendance,
        textbook: textbook,
        polarizing: polarization,
    });
}

export async function getSubjectiveMetricsFromProfessor(
    browser: Browser,
    page: Page,
    name: Name,
): Promise<[SubjectiveMetrics, string, string] | undefined> {
    await goToRMPStart(browser, page);
    const profInputElem = await fillProfName(browser, page, name);
    if (!profInputElem) {
        throw new Error('Prof name failed to fill in');
    }

    await fillSchool(browser, page);

    const profPageListSuccess = await navigateToProfListPage(
        browser,
        page,
        profInputElem,
    );
    if (!profPageListSuccess) {
        throw new Error('Prof list page navigation failed ');
    }

    const firstProfPageSuccess = await navigateToFirstProfPage(
        browser,
        page,
        name,
    );
    if (!firstProfPageSuccess) {
        return undefined;
    }

    const loadAllRatingsSuccessful = await loadAllRatings(browser, page);
    if (!loadAllRatingsSuccessful) {
        throw new Error('Ratings failed to load ');
    }

    const metrics = await getAllComments(browser, page);
    const subjectiveMetrics = getSubjectiveMetrics(metrics);
    const studentLetter = await getStudentLetter(metrics);
    const professorLetter = await getProfLetter(metrics);
    return [subjectiveMetrics, studentLetter, professorLetter];
}

export async function setProfessorSubjectiveMetricsLimited(
    browser: Browser,
    page: Page,
    professors: Professor[],
    innerBar: cliProgress.SingleBar,
): Promise<Boolean> {
    if (professors.length > RMP_ARRAY_LIMIT) {
        console.log(
            'WARNING: make sure to split professor array before calling function or increase RMP_ARRAY_LIMIT in config.json',
        );
        return false;
    }

    /* return false if no basic info exists */
    const basicInfoDefined = Object.values(
        professors.map((professor) => professor.basicInfo),
    ).every(Boolean);
    if (!basicInfoDefined) {
        console.log(
            'WARNING: make sure basic info is defined for all professors passed in',
        );
        return false;
    }

    /* return false if no objective metrics exists */
    const objectiveMetricsDefined = Object.values(
        professors.map((professor) => professor.objectiveMetrics),
    ).every(Boolean);
    if (!objectiveMetricsDefined) {
        console.log(
            'WARNING: make sure objective metrics defined for all professors passed in',
        );
        return false;
    }

    /* return false if any professor has a gpa of 0 */
    const invalidProfessors = professors.filter(
        (professor) => professor.objectiveMetrics?.gpa == 0,
    );
    if (invalidProfessors.length > 0) {
        console.log(
            'WARNING: make sure professors have a gpa before passing into function',
        );
        return false;
    }

    for (let i = 0; i < professors.length; i++) {
        try {
            const profName: Name = professors[i].basicInfo!.name;
            const subjectiveMetrics = await getSubjectiveMetricsFromProfessor(
                browser,
                page,
                profName,
            );

            if (subjectiveMetrics) {
                const [SubjectiveMetrics, studentLetter, professorLetter] =
                    subjectiveMetrics;
                professors[i].subjectiveMetrics = SubjectiveMetrics;

                if (professors[i].aIPromptAnswers === undefined) {
                    professors[i].aIPromptAnswers = new AIPromptAnswers({
                        letterToProfessor: professorLetter,
                        letterToStudent: studentLetter,
                        funFacts: undefined,
                    });
                } else {
                    professors[i].aIPromptAnswers = new AIPromptAnswers({
                        letterToProfessor: professorLetter,
                        letterToStudent: studentLetter,
                        funFacts: professors[i].aIPromptAnswers?.funFacts,
                    });
                }
            }
        } catch (err: any) {
            if (
                err.message ===
                'Fun facts must be an array of length 5 for each fun fact'
            ) {
                console.log(err);
                console.log('Invalid professor object found:');
                console.log(professors[i]);
            } else if (err.name !== 'TimeoutError') {
                console.log('WARNING: AN UNKNOWN ERROR TOOK PLACE');
                console.log(err);
            }
        } finally {
            innerBar.increment();
        }
    }
    return true;
}
