// import { serializeNonPOJOs } from '$lib/server/service/types';
// import type { ReadonlyDevice } from '../../hooks.client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({
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

	// console.debug(deviceArray);
	// const devices = new Array<{title: string; slug: string; href: string;}>()
	// data?.forEach((service) => {
	//     devices.push({
	//         title: service.AssignedName,
	//         href: DataId(service),
	//         slug: service.name
	//     })
	// })
	// onDevices((device) => console.log(device));
	// const devices = await layOutdata.data;
	// console.log(layOutdata)
	const devices = Array.from(discoveredMap.values());
	// const clones = devices.map((d) => d.serialize()!);
	// const devicesClone = structuredClone(devices);
	return {
		device: route.id,
		data: devices // as Dev
	}; // satisfies PageServerLoad;
};
