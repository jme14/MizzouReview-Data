// this file is for interacting with the mucourses api
import axios from 'axios';
import { Name } from './models/name';
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
    name: Name
): Promise<mucoursesData[]> {

    let allCourses = await getCourses();
    const exactResults: mucoursesData[] = [];
    const almostResults: mucoursesData[] = [];

    // might be able to speed up
    allCourses.forEach((course: mucoursesData) => {
        const instructor = Name.getNameFromString(course.instructor, "{lname}, {fname} {mname}") 

        console.log(instructor)
        console.log(name)
        // exact name similarity
        if (instructor === name){
            exactResults.push(course)
        }
        // almost the same name 
        else if (instructor.equalityIgnoringMiddleName(name)){
            almostResults.push(course)
        }

    });

    // if an exact match, return 
    if (exactResults.length != 0) {
        return exactResults;
    }

    // if no exact matches, return what almost captured
    return almostResults;
}
