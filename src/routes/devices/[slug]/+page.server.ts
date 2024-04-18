import type { PageServerLoad } from './$types';
import type { KV } from "$lib/server/spsConf.server";



export const load: PageServerLoad = async ({ params, parent, route }) => { //? PageData    
    console.debug(`${route.id}.PageServerLoad`)
    const layOutdata = await parent()
    return {
        data: layOutdata
    }
};