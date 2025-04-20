// this file is for interacting with the mucourses api
import axios from 'axios';
import {
    Professor,
    ObjectiveMetrics,
} from 'mizzoureview-reading/models/professor';
import { Name } from 'mizzoureview-reading/models/name';

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
export async function getCourseArray(): Promise<mucoursesData[]> {
    try {
        const { data } = await axios.get('https://mucourses.com/api/courses');
        const fetchData: mucoursesData[] = data;
        const validatedData: mucoursesData[] = fetchData.map((data: any) => {
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
        });
        return validatedData;
    } catch (error) {
        console.error('Error fetching courses:', error);
    }
    return [];
}

export function getProfessorCourseMapFromCourseArray(
    courseArray: mucoursesData[],
) {
    courseArray = courseArray.filter((course) => course.instructor !== '');

    const nameCourseArray = courseArray.map((course) => {
        return {
            name: Name.getNameFromString(
                course.instructor.toUpperCase(),
                '{lname},{fname} {mname}',
            ).toString(),
            course: course,
        };
    });

    const professorCourseMap = new Map<string, mucoursesData[]>();
    nameCourseArray.forEach((tuple) => {
        const arrayOfInterest = professorCourseMap.get(tuple.name);

        // if the professor name not found yet
        if (arrayOfInterest) {
            arrayOfInterest.push(tuple.course);
        } else {
            professorCourseMap.set(tuple.name, [tuple.course]);
        }
    });
    return professorCourseMap;
}
export async function getProfessorCourseMap(): Promise<
    Map<string, mucoursesData[]>
> {
    const courses = await getCourseArray();
    if (courses.length == 0) {
        throw new Error('mucourses API call failure');
    }
    const professorCourseMap = getProfessorCourseMapFromCourseArray(courses);
    return professorCourseMap;
}
export function getCoursesByProfessor(
    name: Name,
    professorCourseMap: Map<string, mucoursesData[]>,
): mucoursesData[] {
    const courses = professorCourseMap.get(name.toString().toUpperCase());
    if (!courses) {
        return [];
    }
    return courses;
}

export function getProfessorObjectiveMetricsAndTenure(
    professorCourseMap: Map<string, mucoursesData[]>,
    professor: Professor,
): { objMet?: ObjectiveMetrics; tenure?: number } {
    if (!professor.basicInfo) {
        throw new Error('Professor has invalid basic info');
    }
    if (!professor.basicInfo.name) {
        throw new Error('Professor has invalid name');
    }
    const profCourses = getCoursesByProfessor(
        professor.basicInfo!.name,
        professorCourseMap,
    );

    if (profCourses.length == 0) {
        return {
            objMet: undefined,
            tenure: undefined,
        };
    }

    let totalAverages = 0;
    let totalTotalStudents = 0;

    const getYearFromTerm = (course: mucoursesData) =>
        parseInt(course.term.slice(-4));

    let oldestCourseYear = getYearFromTerm(profCourses[0]);

    for (let i = 0; i < profCourses.length; i++) {
        const totalStudents =
            profCourses[i].arange +
            profCourses[i].brange +
            profCourses[i].crange +
            profCourses[i].drange +
            profCourses[i].frange;
        totalAverages += totalAverages + profCourses[i].average * totalStudents;
        totalTotalStudents += totalTotalStudents + totalStudents;

        const courseYear = getYearFromTerm(profCourses[i]);
        if (courseYear < oldestCourseYear) {
            oldestCourseYear = courseYear;
        }
    }
    const gpa =
        totalTotalStudents !== 0 ? totalAverages / totalTotalStudents : 0;

    if (gpa < 0 || gpa > 4) {
        throw new Error('Invalid GPA calculation');
    }

    const currentYear = new Date().getFullYear();

    const tenure = currentYear - oldestCourseYear;

    return {
        objMet: new ObjectiveMetrics(gpa, 0),
        tenure: tenure,
    };
}

/**
 * Updates the given professor array with objective metrics derived from mucourses.com as well as tenure
 * @param professors
 * @returns true on success, false on failure
 */
export async function setProfessorMUCoursesData(
    professors: Professor[],
): Promise<Boolean> {
    try {
        const professorCourseMap = await getProfessorCourseMap();
        professors.forEach((professor) => {
            const { objMet, tenure } = getProfessorObjectiveMetricsAndTenure(
                professorCourseMap,
                professor,
            );
            professor.objectiveMetrics = objMet;
            if (professor.basicInfo !== undefined) {
                professor.basicInfo.tenure = tenure;
            }
        });
        return true;
    } catch (e) {
        return false;
    }
}
