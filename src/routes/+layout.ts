/* This file was created by inlang.
It is needed in order to circumvent a current limitation of SvelteKit. See https://github.com/inlang/inlang/issues/647
You can remove this comment and modify the file as you like. We just need to make sure it exists.
Please do not delete it (inlang will recreate it if needed). */
import type { LayoutLoad } from './$types';

const toProperCase = (str: string) => str.charAt(0).toUpperCase() + str.substring(1)
export const load: LayoutLoad = async ({params,
	data, //? LayoutServerData from layout.server.ts
	route}) => {
	console.debug(`${route.id}.LayoutLoad`)
	const sections:Array<{slug: string; title: string; text:string; href:string;}> = new Array()
	data.data.forEach(item => 
        sections.push(
			{
				slug: item, 
				title: toProperCase(item), 
				text: toProperCase(item), 
				href: '/'+item, 
			})
        );
	return { 
		data: sections,
		sections: sections
	};
};