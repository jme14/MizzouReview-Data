import {chromium} from 'playwright'

export async function readWebsite(){
    const browser = await chromium.launch()
    const page = await browser.newPage()
    await page.goto("https://www.ratemyprofessors.com/search/professors/")
    const inputLocator = page.locator("input")
    const inputCount = await inputLocator.count() 

    for (let i = 0 ; i  < inputCount ; i++){
        const inputElement = inputLocator.nth(i)
        const placeholders = await inputElement.getAttribute("placeholder")
        console.log(placeholders)
    }
    await browser.close()
    return true
}