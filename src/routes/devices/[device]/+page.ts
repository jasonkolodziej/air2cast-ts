import type { PageLoad } from './$types';
export const prerender = 'auto';

export const load: PageLoad = (async ({
	params: { device },
	parent, // ? LayoutData from layout.ts
	data, //? PageServerData from page.server.ts
	route
}) => {
	console.debug(`${route.id}=@${device}.PageLoad`);
	const layoutData = await parent();
	console.debug(`${route.id}.PageLoad.parentINSLUG`, layoutData);
	// const promise = data.stream.promised as Promise<DeviceServices>
	/// data.data.
	return {
		device: data.device
	}; // satisfies PageLoad;
}) satisfies PageLoad;
