import {join} from "path"
import {readFileSync} from "fs";
/**
 * 
 * @param {string} path 
 * @param {string} includedir 
 */
export function getFromFile(path: string, includedir:string) {    
    return readFileSync(join(includedir, path), "utf-8")
}

/**
 * 
 * @param {string} string file contents
 * @param {(path:string, basedir:string)=>string} getFunction 
 */
function _include(string:string, includedir:string, getFunction:(path:string, basedir:string)=>string, nested_level:number):string {
    if (nested_level > 10) throw new Error("Nesting with @include only is allowed up to a level of 10 times")
    return string.replace(/@include \"((?:[^\"\\]|\\.)*)\"/g, (_, path) => {
        const content = getFunction(path, includedir)
        return _include(content, includedir, getFunction, nested_level + 1)
    })
}

/**
 * 
 * @param {string} string file contents
 * @param {(path:string, basedir:string)=>string} getFunction 
 */
export function include(string:string, includedir:string, getFunction:(path:string, basedir:string)=>string) {
    return _include(string, includedir, getFunction, 0)
}


