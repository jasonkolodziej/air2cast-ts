import type { PageServerLoad } from './$types';
import type { KV } from "$lib/server/spsConf.server";



export const load: PageServerLoad = async ({ params, parent, route }) => { //? PageData    
    const layOutdata = await parent();
    console.debug(`${route.id}.PageServerLoad`)
    // const devices = await layOutdata.data;
    // console.log(layOutdata)
    return {
        data: layOutdata
    }
};