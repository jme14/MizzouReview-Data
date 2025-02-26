// this is for testing the complete process of looking professors up,
// searching the relevent fields, and populating their information

import {getProfessorNames} from "./mucatalog"
import {getCoursesByProfessor} from "./mucourses"
import {getArticleContentByName} from "./wikipedia" 

import { Professor } from "./models/professor"

const TESTING = true
async function main(){

    // get professor names 
    let allProfessorNames = await getProfessorNames()
    // if testing, make names a subset 
    if (TESTING){
        allProfessorNames = allProfessorNames.slice(0,20)
    }

    // get mucourses data

    // apply wikipedia search

    // write to database 
}