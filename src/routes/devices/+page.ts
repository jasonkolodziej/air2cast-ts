import type { PageLoad } from './$types';

export const load: PageLoad = async ({
	params,
	data, //? PageServerData from page.server.ts
	route,
	parent
}) => {
	console.debug(`${route.id}.PageLoad=[DEVICES]`);
	return data;
};

export const prerender = 'auto';
