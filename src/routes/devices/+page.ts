import type { PageLoad } from './$types';

export const load: PageLoad = async ({
	data, //? PageServerData from page.server.ts
	route
}) => {
	console.debug(`${route.id}.PageLoad=[DEVICES]`);
	return data;
};

export const prerender = 'auto';
