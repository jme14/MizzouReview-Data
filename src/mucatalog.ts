import axios from 'axios';
import * as cheerio from 'cheerio';

import { Name } from 'mizzoureview-reading/models/name';
import { BasicInfo } from 'mizzoureview-reading/models/professor';

export async function fetchCatalogPage(): Promise<string> {
    try {
        const { data } = await axios.get(
            'https://catalog.missouri.edu/faculty/',
        );
        return data;
    } catch (error) {
        console.error('Error fetching mu professor names:', error);
    }
    return '';
}

function parseFacultyString(
    name: Name,
    facString: string,
): BasicInfo | undefined {
    // the strings are expected to be of the following format:
    // name; title; department; education; school
    // except only department is required

    const facParts = facString.split(';').map((facPart) => facPart.trim());

    const titlePattern =
        /\b(instructor|part-time|emeritus|prof|residnt|resrch|spclst|fellow|adjunct|director)\b/i;
    // if it's doctor, we have education
    const educationPattern =
        /\b(doctor|bachelor|master|hs graduate or equivalent|registered nurse|specialist of education|degree 1|college 1|not indicated)\b/i;
    // if university is in there, we know it describes the school
    const schoolPattern = /\b(university)\b/i;

    // this means all five parts are here, and our job is easy
    if (facParts.length == 5) {
        const title = facParts[1];
        const department = facParts[2];
        const education = facParts[3];
        return new BasicInfo(name, department, {
            title: title,
            education: education,
        });
    }

    // these mean that something has been left out
    else if (facParts.length == 4) {
        // either title, highest degree attained, or institution of highest degree have been omitted.

        // if the 2nd item doesn't match the title pattern, probably title is omitted
        if (!facParts[1].match(titlePattern)) {
            const department = facParts[1];
            const education = facParts[2];
            return new BasicInfo(name, department, { education: education });
        }
        // otherwise, we have our title
        const title = facParts[1];
        const department = facParts[2];

        // no good tests for department,  so now to testing education

        // if the education is a match, we are good
        if (facParts[3].match(educationPattern)) {
            // in this case, school was omitted
            const education = facParts[3];
            return new BasicInfo(name, department, {
                title: title,
                education: education,
            });
        } else if (facParts[3].match(schoolPattern)) {
            // in this case, school wasn't omitted, but education was
            return new BasicInfo(name, department, { title: title });
        } else {
            // in this case, our regex can improve, and the code should be edited
            throw new Error('Regex is confusing me.');
        }
    } else if (facParts.length == 3) {
        // in this case, only 1 of the following is here: title, education, or school
        if (facParts[1].match(titlePattern)) {
            const title = facParts[1];
            const department = facParts[2];
            return new BasicInfo(name, department, { title: title });
        }
        const department = facParts[1];
        // education is the other field
        if (facParts[2].match(educationPattern)) {
            const education = facParts[2];
            return new BasicInfo(name, department, { education: education });
        }
        // school is the other field
        if (facParts[2].match(schoolPattern)) {
            return new BasicInfo(name, department);
        }
        // if matching not as expected, fix regex
        throw new Error("Incomplete regex; can't parse line");

        // in this case, we only have name and department.
    } else if (facParts.length == 2) {
        const department = facParts[1];
        return new BasicInfo(name, department);
        // no department, just a name on the line
    } else if (facParts.length == 1) {
        return new BasicInfo(name, 'NO DEPARTMENT FOUND');
        // line's got nothing
    } else {
        throw new Error(
            'Invalid line passed, check lines before using this function',
        );
    }
}
export async function getProfessorBasicInfo(): Promise<BasicInfo[]> {
    const webpageContent = await fetchCatalogPage();
    if (webpageContent == '') {
        return [];
    }

    const $ = cheerio.load(webpageContent);
    const paragraphs = $('p');
    const paragraphsWithStrong = paragraphs.has('strong');
    const basicInfoArray: BasicInfo[] = [];
    paragraphsWithStrong.each((i, el) => {
        const completeString = $(el).text();
        const nameString = $(el).find('strong').text();
        const currentName = Name.getNameFromString(
            nameString,
            '{lname},{fname} {mname}',
        );
        const currentBasicInfo = parseFacultyString(
            currentName,
            completeString,
        );
        if (currentBasicInfo == undefined) {
            throw new Error('basic info undefined, weird parsing error');
        }
        basicInfoArray.push(currentBasicInfo);
    });

    return basicInfoArray;
}

// this is just for debugging
export async function writeProfessorsToLog() {
    const result = await fetchCatalogPage();
    const $ = cheerio.load(result);

    $('p')
        .has('strong')
        .each((i, el) => {
            console.log($(el).text());
        });
}
