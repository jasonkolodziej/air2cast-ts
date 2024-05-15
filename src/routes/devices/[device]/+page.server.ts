import type { Device } from '$lib/server/devices/device';
import type { PageServerLoad } from './$types';
// import type { KV } from '$lib/server/sps/types';

export const load: PageServerLoad = async ({
	params,
	isDataRequest,
	parent, // ? LayoutData from layout.ts
	route
}) => {
	console.debug(`${route.id}=@${params.device}.PageServerLoad ${isDataRequest}`);
	const layOutdata = await parent();
	console.log('PageServerLoad!#$!@#!@#$!@#$!', layOutdata);
	const device = layOutdata.devices.filter((dev) => (dev as Device).id === params.device).pop();
	return {
		// data: {
		// 	device
		// 	// device: device?.deviceData,
		// 	// deviceStatus: await device?.deviceStatus
		// 	// config: modifiedData(device?.deviceData?.templateConfiguration)
		// },
		device: device,
		route: route.id
	};
};
