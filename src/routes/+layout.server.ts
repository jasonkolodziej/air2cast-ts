import type { LayoutServerLoad } from './$types';
import { PWD } from "$env/static/private";
import * as fs from "fs";
// import { dataArray } from "$lib/server/libconfig.server";
import { json } from '@sveltejs/kit';

export const load: LayoutServerLoad = ({ cookies, params }) => { //? LayoutData
    console.info("LayoutServerLoad", params)
	const sessionid = cookies.get('sessionid');
    return {
        data: JSON.parse(fs.readFileSync(PWD+"/src/lib/server/spsConf.json", 'utf-8'))
    }
};