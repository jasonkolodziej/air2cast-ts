import type { Device } from '$lib/server/devices/device';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = (async ({
	locals: { discoveredMap },
	params: { device },
	isDataRequest,
	parent, // ? LayoutData from layout.ts
	route
}) => {
	console.debug(`${route.id}=@${device}.PageServerLoad ${isDataRequest}`);
	const layOutdata = await parent();
	console.log('PageServerLoad!#$!@#!@#$!@#$!', layOutdata);

	const fDevice = layOutdata.devices?.filter((dev) => (dev as Device).id === device).pop();
	return {
		// data: {
		// 	device
		// 	// device: device?.deviceData,
		// 	// deviceStatus: await device?.deviceStatus
		// 	// config: modifiedData(device?.deviceData?.templateConfiguration)
		// },
		device: { id: device, data: fDevice },
		route: route.id
	};
}) satisfies PageServerLoad;
