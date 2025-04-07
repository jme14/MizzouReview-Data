// this file is for interacting with the mucourses api
import axios from 'axios';
import { Name } from 'mizzoureview-reading'
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
        const fetchData:mucoursesData[] = data;
        const validatedData: mucoursesData[] = fetchData.map(
            (data: any) => {
                return {
                    dept: data.dept,
                    title: data.title,
                    number: data.number,
                    section: data.section,
                    term: data.term,
                    instructor: data.instructor,
                    arange:
                        typeof data.arange === 'string'
                            ? Number(data.arange)
                            : data.arange,
                    brange:
                        typeof data.brange === 'string'
                            ? Number(data.brange)
                            : data.brange,
                    crange:
                        typeof data.crange === 'string'
                            ? Number(data.crange)
                            : data.crange,
                    drange:
                        typeof data.drange === 'string'
                            ? Number(data.drange)
                            : data.drange,
                    frange:
                        typeof data.frange === 'string'
                            ? Number(data.frange)
                            : data.frange,
                    average:
                        typeof data.average === 'string'
                            ? Number(data.average)
                            : data.average,
                };
            },
        );
        return validatedData;
    } catch (error) {
        console.error('Error fetching courses:', error);
    }
    return [];
}

export function getCoursesByProfessor(
    name: Name,
    allCourses: mucoursesData[],
): mucoursesData[] {

    if (!allCourses){
        throw new Error("allCourses undefined")
    }

    // remove courses without an instructor  
    allCourses = allCourses.filter((course) => course.instructor !== '');

    const exactResultsEmpty: mucoursesData[] = [];
    const almostResultsEmpty: mucoursesData[] = [];

    // can you tell I just learned how to use reduce?
    const [exactResults, almostResults] = allCourses.reduce((buckets, course) => {
        const instructorName = Name.getNameFromString(course.instructor, '{lname},{fname} {mname}')
        if (instructorName === name) {
            // put into exact bucket 
            buckets[0].push(course)
        } else if (instructorName.equalityIgnoringMiddleName(name)){
            // put into almost bucket 
            buckets[1].push(course)
        }
        return buckets

    }, [exactResultsEmpty, almostResultsEmpty])

    // if an exact match, return
    if (exactResults.length != 0) {
        return exactResults;
    }

    // if no exact matches, return what almost captured
    return almostResults;
}
