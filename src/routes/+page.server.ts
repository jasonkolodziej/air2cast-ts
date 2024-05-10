import type { PageServerLoad } from './$types';
import type { KV } from "$lib/server/sps/sps.server";



export const load: PageServerLoad = async ({params,
    isDataRequest,
    parent, // ? LayoutServerData from layout.server.ts
    // data, //? PageServerData from page.server.ts
    route}) => {
    const { data } = await parent();
    console.debug(`${route.id}.PageServerLoad ${isDataRequest}`)
    return {
        data: data
    }
};