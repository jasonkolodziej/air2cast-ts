// ? https://kit.svelte.dev/docs/hooks#server-hooks
import { arpAll } from '$lib/server/arp.server';
import { type DeviceServices, discoverChromeCast, StartStopNotify, StartStopNotifySlug, type DeviceInfo } from '$lib/server/mdns.server';
import { json, type Handle, type HandleFetch, type ResolveOptions } from '@sveltejs/kit';
import { readonly } from 'svelte/store';
// import {
// 	createReadableStream,
// 	getRequest,
// 	setResponse
// } from '@sveltejs/kit/node';
// import { sequence } from '@sveltejs/kit/hooks';

export const handle: Handle = async ({ event, resolve }) => {
    console.debug("hooks.server.handle");
    // const devices = await handleDiscoverDevices({event, resolve});
    // console.debug(devices)
    // devices.subscribe(val => console.log(val))

    // const ipTest = '192.168.2.152'
    // arpDevice(ipTest)?.stdout?.on('data', (stream) => console.log(ArpDataCache(stream)))
   
    // gl-mt3000.localdomain (192.168.2.61) at 9e:83:c4:3d:ce:3d on en0 ifscope [ethernet]
    // let oo = Parse(test) as object
    // console.log(oo)
	if (event.url.pathname.startsWith('/custom')) {
		return new Response('custom response');
	}

	if (event.url.pathname.startsWith('/devices') && event.isDataRequest) {
		console.debug(event)
		const cast = discoverChromeCast;
		const arpData = arpAll();
		// console.debug(arpData)
		// const devices = 
		event.locals = {devices: StartStopNotify(cast.onAvailable, cast.onUnavailable, cast.onUpdate, arpData)}
		// return await resolve(event, )
		// const readonlyDevices = readonly(devices);
		// return new Promise((res) => 
		// 	readonlyDevices.subscribe(val => res(json(val)))
		// )
	}
	console.debug('resolving event')
	const response = await resolve(event);
	console.debug('returning response')
	return response;
};

export const handleFetch: HandleFetch = async ({ request, fetch }) => {
    console.debug("hooks.server.handleFetch");
	if (request.url.startsWith('https://api.yourapp.com/')) {
		// clone the original request, but change the URL
		request = new Request(
			request.url.replace('https://api.yourapp.com/', 'http://localhost:9999/'),
			request,
		);
	}

	return fetch(request);
};

const handleDiscoverDevices: Handle = async ({ event, resolve }) => {
    console.debug("hooks.server.handleDiscoverDevices")
    const cast = discoverChromeCast;
    const arpData = arpAll();
    // console.debug(arpData)
    const devices = StartStopNotify(cast.onAvailable, cast.onUnavailable, cast.onUpdate, arpData)
	const readonlyDevices = readonly(devices)
	return json(readonlyDevices)
    // return new Promise(json(readonlyDevices))
};

// const handleArpAll: Handle = async ({ event, resolve }) => {
//     console.debug("hooks.server.handleArpAll")

//     // const arpData = arpAll();
    
    
//     return await resolve(event)
// };

// export const handleSequence = sequence(handleArpAll, handleDiscoverDevices);