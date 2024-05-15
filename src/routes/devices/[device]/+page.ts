import type { PageLoad } from './$types';
export const prerender = 'auto';

export const load: PageLoad = async ({
	params,
	parent, // ? LayoutData from layout.ts
	data, //? PageServerData from page.server.ts
	route
}) => {
	console.debug(`${route.id}=@${params.device}.PageLoad`);
	const layoutData = await parent();
	console.debug(`${route.id}.PageLoad.parentINSLUG`, layoutData);
	// const promise = data.stream.promised as Promise<DeviceServices>
	/// data.data.
	return {
		data: data.data,
		route: route.id
	};
};
