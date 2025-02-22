// this file is for interacting with the mucourses api 
import axios from "axios"

export async function getCourses() {
    try {
        const { data } = await axios.get('https://mucourses.com/api/courses');
        return data
    } catch (error) {
        console.error('Error fetching courses:', error);
    }
}

