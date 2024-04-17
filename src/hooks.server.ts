// ? https://kit.svelte.dev/docs/hooks#server-hooks
import type { Handle, HandleFetch } from '@sveltejs/kit';
import {discoverChromeCast, IsTv, StartStopNotify} from '$lib/server/mdns.server';
import { Parse } from '$lib/server/libconfig.server';
import { toLibConfigFile } from '$lib/server/libconfig/toLibConfigFile';
import { arpAll, ArpDataCache, arpDevice } from '$lib/server/arp.server';
import { parsedJson } from '$lib/server/libconfig.server';

export const handle: Handle = async ({ event, resolve }) => {
    console.log("Hooks.server.HANDLE");
    // const cast = discoverChromeCast;

    // const arpData = arpAll();
    // let devices = StartStopNotify(cast.onAvailable, cast.onUnavailable, cast.onUpdate, arpData)
    
    // devices.subscribe(val => console.log(val))

    // const ipTest = '192.168.2.152'
    // arpDevice(ipTest)?.stdout?.on('data', (stream) => console.log(ArpDataCache(stream)))
   
    // gl-mt3000.localdomain (192.168.2.61) at 9e:83:c4:3d:ce:3d on en0 ifscope [ethernet]
    // let oo = Parse(test) as object
    // console.log(oo)

    // console.log("ll", ll);
    // cast.onAvailable();

    // const response = await fetch(
    //   '../lib/server/spsConf.json'
    // )
    // const currencies = await response.json()
    // return response;
	if (event.url.pathname.startsWith('/custom')) {
		return new Response('custom response');
	}

	const response = await resolve(event);
	return response;
};

export const handleFetch: HandleFetch = async ({ request, fetch }) => {
	if (request.url.startsWith('https://api.yourapp.com/')) {
		// clone the original request, but change the URL
		request = new Request(
			request.url.replace('https://api.yourapp.com/', 'http://localhost:9999/'),
			request,
		);
	}

	return fetch(request);
};