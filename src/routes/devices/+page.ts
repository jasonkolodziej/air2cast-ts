// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in prod

import type { PageLoad } from './$types';
export const prerender = 'auto';

export const load: PageLoad = async ({
	params,
	parent, // ? LayoutData from layout.ts
	data, //? PageServerData from page.server.ts
	route
}) => {
	console.debug(`${route.id}.PageLoad`);

	return {
		data: data.data,
		route: route.id
	};
};
