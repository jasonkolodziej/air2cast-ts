import type { PageLoad } from './$types';

export const load: PageLoad = async ({
	params,
	data, //? PageServerData from page.server.ts
	route,
	parent
}) => {
	console.debug(`${route.id}.PageLoad=[${params.deviceId}]`);
	// const layoutData = await parent();
	// console.debug('pageData', pageData)
	// console.debug('layoutData', layoutData)
	// return {
	// sections: [
	// 	{ slug: 'profile', title: 'Profile' },
	// 	{ slug: 'notifications', title: 'Notifications' }
	// ],
	return data;
	// };
};

export const prerender = 'auto';
// export const ssr = true;
// export const csr = false;
// export const prerender = true;
