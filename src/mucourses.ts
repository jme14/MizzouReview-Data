// this file is for interacting with the mucourses api
import axios from 'axios';
import { Professor, Name, ObjectiveMetrics } from 'mizzoureview-reading';
import { ObjectType } from 'typescript';
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

export function getProfessorObjectiveMetrics(
    professorCourseMap: Map<string, mucoursesData[]>,
    professor: Professor,
): ObjectiveMetrics {
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

    let totalAverages = 0;
    let totalTotalStudents = 0;

    for (let i = 0; i < profCourses.length; i++) {
        const totalStudents =
            profCourses[i].arange +
            profCourses[i].brange +
            profCourses[i].crange +
            profCourses[i].drange +
            profCourses[i].frange;
        totalAverages += totalAverages + profCourses[i].average * totalStudents;
        totalTotalStudents += totalTotalStudents + totalStudents;
    }
    const gpa =
        totalTotalStudents !== 0 ? totalAverages / totalTotalStudents : 0;

    if (gpa < 0 || gpa > 4) {
        throw new Error('Invalid GPA calculation');
    }

    return new ObjectiveMetrics(gpa, 0);
}

/**
 * Updates the given professor array with objective metrics derived from mucourses.com
 * @param professors
 * @returns true on success, false on failure
 */
export async function setProfessorObjectiveMetrics(
    professors: Professor[],
): Promise<Boolean> {
    try {
        const professorCourseMap = await getProfessorCourseMap();
        professors.forEach(
            (professor) =>
                (professor.objectiveMetrics = getProfessorObjectiveMetrics(
                    professorCourseMap,
                    professor,
                )),
        );
        return true;
    } catch (e) {
        return false;
    }
}
