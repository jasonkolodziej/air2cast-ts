import type { PageServerLoad } from './$types';
import { modifiedData, type KV } from "$lib/server/spsConf.server";


export const load: PageServerLoad = async ({params,
    isDataRequest,
    parent, // ? LayoutData from layout.ts
    route}) => {    
    console.debug(`${route.id}=@${params.slug}.PageServerLoad ${isDataRequest}`)
    const layOutdata = await parent()
    const device = layOutdata.data.filter((record) => record.Id === params.slug).pop()
    return {
        data: {
            device: device,
            config: modifiedData(device?.templateConfiguration)
        },
        
        route: route.id
    }
};