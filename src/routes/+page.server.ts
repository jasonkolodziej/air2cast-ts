// import { dataArray } from "$lib/server/libconfig.server";
import { json } from "@sveltejs/kit";
import * as fs from "fs";
import type { PageData, PageServerLoad } from './$types';
import { PWD } from "$env/static/private";

interface Description {

}
interface Comment {
    // _description: Array<String> | Description;
    '$style'?: string;
    _isCommented?: boolean;
    _description: Array<String>;
}

interface Section<TName, String> {
    _comments: Comment;
    TName: KV;
}

interface KV {
    _value: any;
    '$type': String;
    _description: Comment;
}

export const load: PageServerLoad = async ({ params, parent }) => { //? PageData    
    const layOutdata = await parent();
    console.info("PageServerLoad")
    console.info(layOutdata.data)
	// return {
	// 	post: await db.getPost(params.slug),
	// };

    return {
        data: null// JSON.parse(fs.readFileSync(PWD+"/src/lib/server/spsConf.json", 'utf-8'))
    }
};