// ? Interfaces of `spsConfig.json`
import { PWD } from '$env/static/private';
import * as fs from 'fs';
export interface Comment {
    // _description: Array<String> | Description;
    '$style'?: string;
    _isCommented?: boolean;
    _description: Array<String>;
}

export interface Section<TName, String> {
    _comments: Comment;
    TName: KV;
}

export interface KV {
    _value: any;
    '$type': String;
    _description: Comment;
}

const preLayoutData = JSON.parse(fs.readFileSync(PWD+"/src/lib/server/spsConf.json", 'utf-8'))

export const spsDataObj = Object(preLayoutData);

export const modifiedData = (config?: object) => {
    const data  = Array<{title: string; description: string[]; children: Map<string,KV>}>()
    // console.info(layOutdata)
    const dataObj = config ?? Object(preLayoutData);
    Object.entries(dataObj).forEach(entry => {
        const props = entry[1] as Object;
        const comments = (props as any)['_comments'] as object
        const des = (comments as any)['_description'] as string[]
        let childsMap = new Map<string, KV>()
        const childs = Object.entries(props) // .filter((elem) => { elem[0] !== '_comments' })
        // console.info(childs)
        for (let [key, value] of childs) {
            if (key == '_comments') {
                continue
            }
            // console.log(key, value);
            childsMap = childsMap.set(key, (value as KV))
        }
        // console.log(comments)
        data.push({title: entry[0], description: des, children: childsMap})
    })
    return data
}