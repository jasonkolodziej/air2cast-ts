import type { LayoutServerLoad } from "../$types";
import { ToDeviceRecord, type DeviceRecord } from "$lib/server/mdns.server";
import { serializeNonPOJOs, type Device, type Devices } from "$lib/server/devices.server";

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
    // const devicesArray = new Array<DeviceRecord>(...(devices.DeviceRecords.values()))
    // const strippedDevices = devicesArray.map(
    //     (record) => {
    //         const clean = {templateConfiguration: new Object()} as DeviceRecord;
    //         return {
    //             ...record,
    //             ...clean
    //         } as DeviceRecord;
    // });
    // const strippedDevices = Array.from(devices?.Devices).map(
    //         (device) => {
    //             const clean = {templateConfiguration: undefined} as DeviceRecord;
    //             return {
    //                 ...device.DeviceRecord,
    //                 ...clean
    //             } as DeviceRecord;
    //     });
    const strippedDevices = devices?.DeviceRecordArray(({templateConfiguration: undefined} as DeviceRecord))
    if(isDataRequest) {
        return {
            data: structuredClone(strippedDevices)
            // data: devices.services.map(ToDeviceRecord)
        }
    }
    return {
        data: []
    };
};