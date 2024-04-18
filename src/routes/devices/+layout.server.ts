import { PWD } from "$env/static/private";
import type { LayoutServerLoad } from "../$types";
import * as fs from 'fs'

export const load: LayoutServerLoad = ({ cookies, params, route }) => { //? LayoutData
    console.debug(`${route.id}.LayoutServerLoad`)
    // console.debug(request)
	const sessionid = cookies.get('sessionid');
    // const readableStream = createReadableStream(PWD+"/src/lib/server/spsConf.json")
    return {
        data: JSON.parse(fs.readFileSync(PWD+"/src/lib/server/spsConf.json", 'utf-8'))
    }
};