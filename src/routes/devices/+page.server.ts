// import { serializeNonPOJOs } from '$lib/server/service/types';
// import type { ReadonlyDevice } from '../../hooks.client';
import type { Device } from '$lib/server/devices/device';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = (async ({
	params,
	isSubRequest,
	isDataRequest,
	parent, // ? LayoutServerData from layout.server.ts
	// data, //? PageServerData from page.server.ts
	route,
	locals: { discoveredMap }
}) => {
	// const {
	// 	data: { devices }
	// } = await parent();
	console.debug(`${route.id}.PageServerLoad ${isDataRequest} ${isSubRequest}`);
	const devicesValues = new Array<Device>(...Array.from(discoveredMap.values()));
	const clones = devicesValues.map((d) => d.serialize());
	// const devicesClone = structuredClone(devices);
	// return { devices: devices };
	// console.debug(deviceArray);
	return { devices: clones };
	// onDevices((device) => console.log(device));
	// const devices = await layOutdata.data;
	// console.log(layOutdata)

	// if ((params?. !== undefined) {
	// 	// * see if the deviceId provided in params is in map?
	// 	const maybeDevice = discoveredMap.get(device as string);
	// 	if (maybeDevice !== undefined) {
	// 		return {
	// 			device: {
	// 				id: maybeDevice.id,
	// 				data: maybeDevice.serialize() // as object
	// 			}
	// 		};
	// 	}
	// }
}) satisfies PageServerLoad;
