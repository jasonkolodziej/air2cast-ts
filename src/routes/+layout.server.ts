import type { LayoutServerLoad } from './$types';
import { PWD } from '$env/static/private';
import { readdirSync } from 'fs';
// import { dataArray } from "$lib/server/libconfig.server";

export const load: LayoutServerLoad = (async ({ cookies, isDataRequest, route }) => {
	console.debug(`${route.id}.LayoutServerLoad ${isDataRequest}`);
	// console.debug('event.locals', locals)
	//* Cookies
	//* determine the routes of the App
	const dirContent = readdirSync(PWD + '/src/routes'); // .filter(val => val.valueOf())
	const routes = dirContent.filter(
		(content) => !content.endsWith('.svelte') && !content.endsWith('.ts')
	);
	// console.info(routes)
	// const readableStream = createReadableStream(PWD+"/src/lib/server/spsConf.json")
	return {
		data: {
			routes: routes
		}
	};
}) satisfies LayoutServerLoad;
