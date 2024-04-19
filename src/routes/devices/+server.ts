import { PWD } from "$env/static/private";
import { arpAll } from "$lib/server/arp.server";
import { discoverChromeCast, StartStopNotify, type DeviceServices } from "$lib/server/mdns.server";
import { json } from "@sveltejs/kit";
import { setResponse } from "@sveltejs/kit/node";
import * as fs from 'fs';
import { devices } from "playwright/test";
import { readonly } from "svelte/store";

// export async function GET({ request, cookies, route }) {
//     console.debug(`${route.id}.${request.method}`)
// 	// const { description } = await request.json();
//         // const cast = discoverChromeCast;
//         // const arpData = arpAll();
//         // console.debug(arpData)
//         // const devices = StartStopNotify(cast.onAvailable, cast.onUnavailable, cast.onUpdate, arpData)
//         // const readonlyDevices = readonly(devices)
// 	// const userid = cookies.get('userid');
// 	// const { id } = await database.createTodo({ userid, description });
// 	// return json({ id }, { status: 201 });
// 	// return json({
//     //     data: JSON.parse(fs.readFileSync(PWD+"/src/lib/server/spsConf.json", 'utf-8'))
//     // })

//     return new Promise<Response>((res) => {
		
// 		// readonlyDevices.subscribe((device) => {
// 		// 	res(new Response({stream() {
				
// 		// 	},}))
// 		// })
// 	})
// }

