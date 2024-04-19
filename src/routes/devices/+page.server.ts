import type { PageServerLoad } from './$types';
import type { KV } from "$lib/server/spsConf.server";
import type { DeviceServices } from '$lib/server/mdns.server';

// const handleDiscoverDevices: Handle = async ({ event, resolve }) => {
//     console.debug("hooks.server.handleDiscoverDevices")
//     const cast = discoverChromeCast;
//     const arpData = arpAll();
//     // console.debug(arpData)
//     const devices = StartStopNotify(cast.onAvailable, cast.onUnavailable, cast.onUpdate, arpData)
// 	const readonlyDevices = readonly(devices)
// 	return json(readonlyDevices)
//     // return new Promise(json(readonlyDevices))
// };

export const load: PageServerLoad = async ({ fetch, params, parent, route, isDataRequest, locals }) => { //? PageData    
    console.debug(`${route.id}.PageServerLoad ${isDataRequest}`)
    // const getData = fetch('/devices', {method: 'POST'})
    const layOutdata = await parent()
    const promised = layOutdata.stream // as Promise<DeviceServices>


    // const promised = await layOutdata.promise
    console.log(promised)
    
    // layOutdata.data.forEach((ele) => {
    //     const cur = ele as object;
    //     console.error(cur)
    // });
	// return {
	// 	post: await db.getPost(params.slug),
	// };

    return {
        // data: layOutdata
        stream: {
            promised
        }
    }
};