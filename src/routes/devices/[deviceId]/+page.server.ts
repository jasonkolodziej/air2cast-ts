import type { EntryGenerator, PageServerLoad } from './$types';
import { discoveredMap } from '$lib/server/devices/devices.server';
import type { DeviceService } from '$lib/server/devices/device';

// export const entries: EntryGenerator = async ({ fetch }) => {
// 	const response = await fetch('/api/devices');
// 	const devices = (await response.json()) as Array<DeviceService>;
// 	console.log('/device/[deviceId].entries', devices);
// 	return devices.map((val) => {
// 		return { deviceId: val.id };
// 	});
// 	// return Array.from(ids!).map<{ deviceId?: string }>((s) => {
// 	// 	return { deviceId: s.toLowerCase() };
// 	// });
// };

export const load: PageServerLoad = async ({
	params,
	route,
	parent,
	locals: { discoveredMap }
}) => {
	const { deviceId } = params;
	console.debug(`${route.id}.PageServerLoad@[${deviceId}]`);
	// * specific device
	if (params.deviceId !== undefined) {
		const found = discoveredMap.get(deviceId);
		if (found !== undefined) {
			return {
				device: {
					id: found.id,
					data: found.serialize()
				}
			};
		}
	}
}; // ) satisfies PageLoad;
