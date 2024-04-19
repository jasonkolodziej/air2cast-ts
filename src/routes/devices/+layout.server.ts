import { type Readable } from "svelte/store";
import type { LayoutServerLoad } from "../$types";
import type { DeviceServices } from "$lib/server/mdns.server";
import { getContext, setContext } from "svelte";

export const load: LayoutServerLoad = async ({ fetch, cookies, params, route, isDataRequest, parent, locals }) => { //? LayoutData
    console.debug(`${route.id}.LayoutServerLoad ${isDataRequest}`)
    
    // const data = await fetch('/devices', {method: 'GET'})
	const sessionid = cookies.get('sessionid');
    if (isDataRequest) {
        await parent()
        const { devices } = locals
        const readOnlyDev = devices as Readable<DeviceServices>
        const promise = new Promise<DeviceServices>((res) => {
            readOnlyDev?.subscribe((val) => {
                console.debug(val)
                res((val as DeviceServices))
            });
        })
        return {
            stream: promise
        }
    }

    return {
        data: {
            devices: {}
        }
    }

};