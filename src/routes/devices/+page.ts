// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in prod

import type { PageLoad } from './$types';
export const prerender = 'auto';

export const load: PageLoad = (async ({
	parent, // ? LayoutData from layout.ts
	data, //? PageServerData from page.server.ts
	route
}) => {
	console.debug(`${route.id}.PageLoad`);
	// const layoutData = await parent();
	return {
		// devices: data,
		devices: data.devices
		// route: route.id
	};
}) satisfies PageLoad;
