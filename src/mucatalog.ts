import axios from "axios"
import * as cheerio from "cheerio"

export async function fetchCatalogPage(): Promise<string>{
    try {
        const { data } = await axios.get(
            'https://catalog.missouri.edu/faculty/',
        );
        return data;
    } catch (error) {
        console.error('Error fetching mu professor names:', error);
    }
    return "";
}

export async function getProfessorNames(): Promise<string[]>{
    const webpageContent = await fetchCatalogPage()
    if (webpageContent == ""){
        return [] 
    }

    const $ = cheerio.load(webpageContent)
    const elementArray = $("strong").toArray().map((x) => $(x).text())
    elementArray.forEach(elem => console.log(elem))
    return elementArray
}