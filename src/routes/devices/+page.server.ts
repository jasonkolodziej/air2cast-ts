// import { serializeNonPOJOs } from '$lib/server/service/types';
// import type { ReadonlyDevice } from '../../hooks.client';
import type { Device, DeviceService } from '$lib/server/devices/device';
import type { PageServerLoad } from './$types';
import { serializeNonPOJOs } from '$lib/server/service/types';

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
	console.debug(`${route.id}.PageServerLoadparams} ${isDataRequest} ${isSubRequest}`);
	const devicesValues = new Array<DeviceService>(...Array.from(discoveredMap.values()));
	const clones = devicesValues.map((d) => serializeNonPOJOs(d));
	// const devicesClone = structuredClone(devices);
	// return { devices: devices };
	// console.debug(deviceArray);
	return { devices: clones as Array<DeviceService> };
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
