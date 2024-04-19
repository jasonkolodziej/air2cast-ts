// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in prod

import type { DeviceServices } from "$lib/server/mdns.server";
import type { PageLoad } from "./$types";
// export const prerender = true;

export const load: PageLoad = async ({params, parent, route, data}) => {
    console.debug(`${route.id}.PageLoad`);
    const layoutData = await parent();
    const promise = data.stream.promised as Promise<DeviceServices>
    console.log('page', layoutData)
    return {
        stream: {
           promise
        }
    };
}