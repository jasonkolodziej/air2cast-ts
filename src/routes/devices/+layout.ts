import { getContext } from "svelte"
import type { LayoutLoad } from "../$types"



export const load: LayoutLoad = async ({params, parent,
    data, // ? data from parent...
    route}) => {
   console.debug(`${route.id}.LayoutLoad`)
//    const { Somedata } = await parent()
    // const devices = getContext('devices')
    // return {
    //     data: await parent()
    // }

}