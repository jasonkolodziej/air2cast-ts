// import { dataArray } from "$lib/server/libconfig.server";
import { json } from "@sveltejs/kit";
import * as fs from "fs";
import type { PageData, PageServerLoad } from './$types';
import { PWD } from "$env/static/private";
import { Comment } from "$lib/server/libconfig/parts/Comments";

interface Description {

}
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

export const load: PageServerLoad = async ({ params, parent }) => { //? PageData    
    const layOutdata = await parent();
    console.info("PageServerLoad")
    const modifiedData = Array<{title: string; description: string[]; children: Map<String,KV>}>()
    // console.info(layOutdata)
    const dataObj = Object(layOutdata.data);
    Object.entries(dataObj).forEach(entry => {
        const props = entry[1] as Object;
        const comments = (props as any)['_comments'] as object
        const des = (comments as any)['_description'] as string[]
        let childsMap = new Map<String, KV>()
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
        modifiedData.push({title: entry[0],description: des, children: childsMap})
    });
    // layOutdata.data.forEach((ele) => {
    //     const cur = ele as object;
    //     console.error(cur)
    // });
	// return {
	// 	post: await db.getPost(params.slug),
	// };

    return {
        data: modifiedData// JSON.parse(fs.readFileSync(PWD+"/src/lib/server/spsConf.json", 'utf-8'))
    }
};