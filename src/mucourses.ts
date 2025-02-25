// this file is for interacting with the mucourses api
import axios from 'axios';
import {someMiddleInitial, someMiddleName} from "../src/names"

export type mucoursesData = {
    dept: string;
    title: string;
    number: string;
    section: string;
    term: string;
    instructor: string;
    arange: number;
    brange: number;
    crange: number;
    drange: number;
    frange: number;
    average: number;
};

// will eventually want to not export this function
export async function getCourses(): Promise<mucoursesData[]> {
    try {
        const { data } = await axios.get('https://mucourses.com/api/courses');
        return data;
    } catch (error) {
        console.error('Error fetching courses:', error);
    }
    return [];
}

export async function getCoursesByProfessor(
    fname: string,
    lname: string,
    mname?: string,
): Promise<mucoursesData[]> {
    let allCourses = await getCourses();
    const professorNameStringNoMiddle = `${lname},${fname}`;
    const professorNameStringMiddleInitial = `${lname},${fname} ${mname?.slice(
        0,
        1,
    )}`;
    const professorNameStringMiddleName = `${lname},${fname} ${mname}`;

    const potentialNames = [
        professorNameStringMiddleInitial,
        professorNameStringMiddleName,
        professorNameStringNoMiddle,
    ];
    const results: mucoursesData[] = [];

    // might be able to speed up
    allCourses.forEach((course: mucoursesData) => {
        if (potentialNames.includes(course.instructor)) {
            results.push(course);
        // TODO: make this faster?
        // if no middle name,  check for instances of a middle name or middle initial
        } else if (mname == undefined) {
            if (someMiddleInitial(fname, lname, course.instructor)) {
                results.push(course);
            } else if (someMiddleName(fname, lname, course.instructor)) {
                results.push(course);
            }
        }
    });

    if (results.length != 0) {
        return results;
    }

    return [];
}
