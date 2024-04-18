import type { LayoutServerLoad } from './$types';
import { PWD } from "$env/static/private";
import * as fs from "fs";
// import { dataArray } from "$lib/server/libconfig.server";

export const load: LayoutServerLoad = ({ cookies, params }) => { //? LayoutData
    console.info("LayoutServerLoad")
	const sessionid = cookies.get('sessionid');
    // const readableStream = createReadableStream(PWD+"/src/lib/server/spsConf.json")
    return {
        data: JSON.parse(fs.readFileSync(PWD+"/src/lib/server/spsConf.json", 'utf-8'))
    }
};