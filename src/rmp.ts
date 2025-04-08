import {chromium, Page} from 'playwright'

async function sleep(seconds: number){
    await new Promise(resolve => setTimeout(resolve, seconds*1000))
}
// go to RMP
export async function getPage(){
    const browser = await chromium.launch({headless:false})
    // const browser = await chromium.launch()
    const page = await browser.newPage()
    console.log("Awaiting page load")
    // await page.goto("https://www.ratemyprofessors.com/search/professors/", {waitUntil:"load", timeout:0})
    await page.goto("https://www.ratemyprofessors.com/search/professors/", {waitUntil: "domcontentloaded"})
    return page
}
// fill the Professor search item 
export async function fillProfName(page: Page){
    const inputElements = page.getByPlaceholder("Professor name")
    console.log(inputElements.allTextContents())
    return true
}
export async function readWebsite(){

    const page = await getPage() 

    /*
    const elementToClose = page.getByText("Close")
    console.log(elementToClose)
    await page.getByText("Close").click()
    */
    
    const inputLocator = page.locator("input")
    const inputCount = await inputLocator.count() 
    console.log(`There are ${inputCount} inputs`)
    await sleep(2)

    /* 
    console.log("Waiting starts...")
    await new Promise(resolve => setTimeout(resolve, 5000))
    console.log("Waiting complete!")
    */ 

    let professorInput 
    let schoolElement
    for (let i = 0 ; i  < inputCount ; i++){
        const inputElement = inputLocator.nth(i)
        const placeholderText = await inputElement.getAttribute("placeholder")
        console.log(`Looking at input element ${i}, with ${placeholderText}`)
        await sleep(2)
        if (placeholderText === "Professor name"){
            professorInput = inputElement
            await inputElement.fill("Jim Ries")
            await inputElement.focus()
        }
        if (placeholderText === "Your School"){
            await inputElement.fill("University of Missouri - Columbia")
        }
    }
    if (professorInput == undefined){
        console.log("ERROR: professorInput never set")
        return false
    }
    console.log("Filled in data!")
    await sleep(2)
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
}