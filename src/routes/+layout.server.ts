import type { LayoutServerLoad } from './$types';
import { PWD } from "$env/static/private";
import * as fs from "fs";
// import { dataArray } from "$lib/server/libconfig.server";

export const load: LayoutServerLoad = ({ fetch, cookies, params, route }) => { //? LayoutData
    console.debug(`${route.id}.LayoutServerLoad`)
    // console.debug(request)
	const sessionid = cookies.get('sessionid');
    const dirContent = fs.readdirSync(PWD+"/src/routes")// .filter(val => val.valueOf())
    const routes = dirContent.filter((content) => !content.endsWith('.svelte') && !content.endsWith('.ts'))
    // console.info(routes)
    // const readableStream = createReadableStream(PWD+"/src/lib/server/spsConf.json")
    return {
        data: routes
    }
};