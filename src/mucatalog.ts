import axios from "axios"
import * as cheerio from "cheerio"

import { Name } from "./models/name";

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

export async function getProfessorNames(): Promise<Name[]>{
    const webpageContent = await fetchCatalogPage()
    if (webpageContent == ""){
        return [] 
    }

    const $ = cheerio.load(webpageContent)
    const paragraphs = $("p")
    const paragraphsWithStrong = paragraphs.has("strong")
    const nameArray: Name[] = [] 
    paragraphsWithStrong.each((i, el) => {
        console.log($(el).text())
        const nameString = $(el).find('strong').text()
        nameArray.push(Name.getNameFromString(nameString, "{lname},{fname} {mname}"))
    })

    return nameArray 
}