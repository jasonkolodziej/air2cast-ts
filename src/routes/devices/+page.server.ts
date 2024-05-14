import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({
	params,
	isSubRequest,
	isDataRequest,
	parent, // ? LayoutServerData from layout.server.ts
	// data, //? PageServerData from page.server.ts
	route
}) => {
	const { data } = await parent();
	console.debug(`${route.id}.PageServerLoad ${isDataRequest} ${isSubRequest}`);

	// const devices = new Array<{title: string; slug: string; href: string;}>()
	// data?.forEach((service) => {
	//     devices.push({
	//         title: service.AssignedName,
	//         href: DataId(service),
	//         slug: service.name
	//     })
	// })

	// const devices = await layOutdata.data;
	// console.log(layOutdata)
	return {
		device: route.id,
		data: data
	};
};
