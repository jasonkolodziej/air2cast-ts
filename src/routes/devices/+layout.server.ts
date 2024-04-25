import type { LayoutServerLoad } from "../$types";
import { ToDeviceRecord, type DeviceRecord } from "$lib/server/mdns.server";
import type { Device, Devices } from "$lib/server/devices.server";

export const load: LayoutServerLoad = async ({fetch,
    cookies,
    params,
    route, 
    isSubRequest,
    isDataRequest, 
    parent, //? layout.server.ts
    locals }) => { //? LayoutData
    console.debug(`${route.id}.LayoutServerLoad ${isDataRequest} ${isSubRequest}`)
    const devices = locals.devices as Devices;
	const sessionid = cookies.get('sessionid');
    if(isDataRequest) {
        return {
            data: new Array<DeviceRecord>(...(devices.DeviceRecords.values())).map(
            (record) => {
                return { 
                ...record,
                ...{templateConfiguration: undefined} as DeviceRecord,
            }
        })
            // data: devices.services.map(ToDeviceRecord)
        }
    }
    return {
        data: []
    };
};