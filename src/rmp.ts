import {chromium} from 'playwright'

export async function readWebsite(){
    const browser = await chromium.launch({headless:false})
    const page = await browser.newPage()
    console.log("Awaiting page load")
    page.goto("https://www.ratemyprofessors.com/search/professors/", {waitUntil:"load", timeout:0})
    console.log("Done!")

    await page.getByText("Close").click()
    
    const inputLocator = page.locator("input")
    const inputCount = await inputLocator.count() 

    let professorInput 
    let schoolElement
    for (let i = 0 ; i  < inputCount ; i++){
        const inputElement = inputLocator.nth(i)
        const placeholderText = await inputElement.getAttribute("placeholder")
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