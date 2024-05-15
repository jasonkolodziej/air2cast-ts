import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({
	fetch,
	params,
	route,
	parent,
	locals: { discoveredMap }
}) => {
	console.log(params);
	console.debug(`${route.id}.PageServerLoad=[DEVICES]`);
	const deviceVals = Array.from(discoveredMap.values());
	const devices = deviceVals.map((d) => d.serialize());
	// * specific device
	// if (deviceId !== undefined) {
	// 	const found = discoveredMap.get(deviceId);
	// 	if (found !== undefined) {
	// 		return {
	// 			device: {
	// 				id: found.id,
	// 				data: found.serialize()
	// 			}
	// 		};
	// 	}
	// }
	return {
		devices: devices
	};
}; // ) satisfies PageLoad;
