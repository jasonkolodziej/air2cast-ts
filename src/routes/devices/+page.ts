// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in prod
import type { DeviceServices } from "$lib/server/mdns.server";
import type { PageLoad } from "./$types";
// export const prerender = true;

export const load: PageLoad = async ({params,
    parent, // ? LayoutData from layout.ts
    data, //? PageServerData from page.server.ts
    route}) => {
    console.debug(`${route.id}.PageLoad`, data);
    // const layoutData = await parent();
    // console.debug(`${route.id}.PageLoad.parent`, layoutData)
    // const promise = data.stream.promised as Promise<DeviceServices>
    // const quads = new Array()
    /// data.data.
    return {
        data: data.data,
        route: route.id
    };
}