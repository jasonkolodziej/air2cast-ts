import {parseFile, parseString, stripComments} from "$lib/server/libconfig";
import { Group } from "./libconfig/parts/AssignmentStatement";
import { ParseCommentedSetting, RemoveComments } from "./libconfig/parts/Comments";

export const ParseFile = parseFile;

export function withComments(input:string):string {
    return ParseCommentedSetting.parse(input) as unknown as object;
}
export const Parse = (arg0: string) => { 
    let o = Group.parse(`{${stripComments(arg0)}}`) as object;
    o = Object.assign(o, {[Object.keys(o).at(0) as string]:withComments(arg0)})
    // console.log()
    return o
};