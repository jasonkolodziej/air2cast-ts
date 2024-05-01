import type { PageServerLoad } from './$types';
import { modifiedData, type KV } from "$lib/server/spsConf.server";


export const load: PageServerLoad = async ({params,
    isDataRequest,
    parent, // ? LayoutData from layout.ts
    route}) => {    
    console.debug(`${route.id}=@${params.slug}.PageServerLoad ${isDataRequest}`)
    const layOutdata = await parent()
    const device = layOutdata.data.filter((record) => record.deviceData.Id === params.device).pop()
    return {
        data: {
            device: device?.deviceData,
            deviceStatus: await device?.deviceStatus,
            config: modifiedData(device?.deviceData?.templateConfiguration)
        },
        
        route: route.id
    }
};