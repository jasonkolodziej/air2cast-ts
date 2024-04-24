import type { MDNSService } from "tinkerhub-mdns"
import type { LayoutLoad } from "../$types"



export const load: LayoutLoad = async ({params, 
    parent, //? LayoutData from shadowing layout.ts
    data, // ? data from parent...
    route}) => {
    console.debug(`${route.id}.LayoutLoad=@${params.slug}`);
    const parentData = await parent();
    // console.debug(`${route.id}1111111.LayoutLoad.parent`, parentData)
    // console.debug(`${route.id}.LayoutLoad.data`, data)
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
        data: {
            slug: params.slug,
            href: parentData.data?.at(0).href // + (params.slug !== undefined) ? '/' + params.slug : ''
        }
    }

}