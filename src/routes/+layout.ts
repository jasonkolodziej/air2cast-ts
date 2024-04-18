import { json } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import * as fs from "fs";

const toProperCase = (str: string) => str.charAt(0).toUpperCase() + str.substring(1)
export const load: LayoutLoad = async ({params,
	 data, // ? data from parent...
	 route}) => {
	console.debug(`${route.id}.LayoutLoad`)
	// const { data } = await parent();// fetch("https://google.com");
	console.log(data.data)
	const sections:Array<{slug: string; title: string; text:string; href:string;}> = new Array()
	data.data.forEach(item => 
        sections.push(
			{
				slug: item, 
				title: toProperCase(item), 
				text: toProperCase(item), 
				href: '/'+item, 
			})
        )
	return { 
		data: sections,
		sections: sections
		// sections: [
        //     { slug: 'profile', title: 'Profile' },
        //     { slug: 'notifications', title: 'Notifications' }
        // ],
	};
};