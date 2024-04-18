import type { PageServerLoad } from './$types';
import type { KV } from "$lib/server/spsConf.server";



export const load: PageServerLoad = async ({ params, parent, route }) => { //? PageData    
    console.debug(`${route.id}.PageServerLoad`)
    const layOutdata = await parent()
    // console.log(layOutdata)
    
    // layOutdata.data.forEach((ele) => {
    //     const cur = ele as object;
    //     console.error(cur)
    // });
	// return {
	// 	post: await db.getPost(params.slug),
	// };

    return {
        data: layOutdata
    }
};