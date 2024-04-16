import { include, getFromFile } from "./parts/include"
import { Group } from "./parts/AssignmentStatement"
import { RemoveComments } from "./parts/Comments"

/**
 * 
 * @param {string} string
 * @returns {string}
 */
export function stripComments(input:string):string {
    return RemoveComments.parse(input) as unknown as string;
}

/**
 * Parses a string (you must remove comments and process include statements
 *  before passing your string to this methode)
 * @param {string} input 
 * @returns {{[key:string]:any}}
 */
export function parseString(input: string):{[key:string]:any}{
    return Group.parse(`{${stripComments(input)}}`) as {[key:string]:any};
}

/**
 * 
 * @param {string} filename 
 * @param {string} basedir used for `@include`
 * @param {(path:string, basedir:string)=>string} fileReadFunction
 */
export function parseFile(filename:string, basedir:string, fileReadFunction=getFromFile):{[key:string]:any}{
    const content = include(fileReadFunction(filename, basedir), basedir, fileReadFunction)
    return parseString(content)
}

// module.exports = {
//     stripComments,
//     parseString,
//     parseFile,
// }