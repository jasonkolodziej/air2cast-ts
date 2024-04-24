import type { LayoutServerLoad } from "../$types";
import { ToDeviceRecord } from "$lib/server/mdns.server";
import type { MDNSServiceDiscovery } from "tinkerhub-mdns";

export const load: LayoutServerLoad = async ({fetch,
    cookies,
    params,
    route, 
    isSubRequest,
    isDataRequest, 
    parent, //? layout.server.ts
    locals }) => { //? LayoutData
    console.debug(`${route.id}.LayoutServerLoad ${isDataRequest} ${isSubRequest}`)
    const devices = locals.devices as MDNSServiceDiscovery
	const sessionid = cookies.get('sessionid');
    if(isDataRequest) {
        return {
            data: devices.services.map(ToDeviceRecord)
        }
    }
    return {
        data: []
    };
};