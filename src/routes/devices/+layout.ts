import type { LayoutLoad } from './$types';

/**
 *
 * @param params = {device: ?} // * represents a dynamic value like slug
 * @returns partial LayoutLoad data apart of the resolve call via hooks.server
 */
export const load: LayoutLoad = async ({
	params,
	parent, //? LayoutData from shadowing layout.ts
	data, // ? data from parent...
	route
}) => {
	console.debug(`${route.id}.LayoutLoad=@${params.device}`);
	const parentData = await parent();
	// console.debug(`${route.id}1111111.LayoutLoad.parent`, parentData);
	// console.debug(`${route.id}1111111.LayoutLoad.data`, data);
	// const devices = data
	// const sections:Array<{slug: string; title: string; text:string; href:string;}> = new Array()
	// data.data.forEach(item =>
	//     sections.push(
	// 		{
	// 			slug: item,
	// 			title: toProperCase(item),
	// 			text: toProperCase(item),
	// 			href: '/'+item,
	// 		})
	//     );
	return {
		devices: data.devices
		// href: parentData.data?.at(0).href // + (params.slug !== undefined) ? '/' + params.slug : ''
	};
};
