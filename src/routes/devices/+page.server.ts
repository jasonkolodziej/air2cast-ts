import type { PageServerLoad } from './$types';
import type { KV } from "$lib/server/spsConf.server";



export const load: PageServerLoad = async ({ params, parent, route }) => { //? PageData    
    console.debug(`${route.id}.PageServerLoad`)
    const layOutdata = await parent()
    const modifiedData = Array<{title: string; description: string[]; children: Map<String,KV>}>()
    // console.info(layOutdata)
    const dataObj = Object(layOutdata.data);
    Object.entries(dataObj).forEach(entry => {
        const props = entry[1] as Object;
        const comments = (props as any)['_comments'] as object
        const des = (comments as any)['_description'] as string[]
        let childsMap = new Map<String, KV>()
        const childs = Object.entries(props) // .filter((elem) => { elem[0] !== '_comments' })
        // console.info(childs)
        for (let [key, value] of childs) {
            if (key == '_comments') {
                continue
            }
            // console.log(key, value);
            childsMap = childsMap.set(key, (value as KV))
        }
        // console.log(comments)
        modifiedData.push({title: entry[0],description: des, children: childsMap})
    });
    // layOutdata.data.forEach((ele) => {
    //     const cur = ele as object;
    //     console.error(cur)
    // });
	// return {
	// 	post: await db.getPost(params.slug),
	// };

    return {
        data: modifiedData
    }
};