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
    const elementArray = $("strong").toArray().map((x) => $(x).text())
    const nameArray = elementArray.map(elem => Name.getNameFromString(elem, "{lname}, {fname} {mname}"))
    return nameArray 
}