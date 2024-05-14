import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({
	params,
	isSubRequest,
	isDataRequest,
	parent, // ? LayoutServerData from layout.server.ts
	// data, //? PageServerData from page.server.ts
	route,
	locals: { discovered }
}) => {
	// const {
	// 	data: { devices }
	// } = await parent();
	const onDe = discovered.services;
	console.debug(`${route.id}.PageServerLoad ${isDataRequest} ${isSubRequest}`);
	const devices = Array.from(discovered.services);
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
	return {
		device: route.id,
		data: structuredClone(devices)
	};
};
