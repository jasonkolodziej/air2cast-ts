// ? https://kit.svelte.dev/docs/hooks#server-hooks
import type { DeviceService } from '$lib/server/devices/device';
import { discoveredMap } from '$lib/server/devices/devices.server';
import scratchLog from '$lib/server/service/scratchLogging';
import { type Handle, type HandleFetch } from '@sveltejs/kit';

const setupDiscovery = (locals: App.Locals) => {
	console.debug('hooks.server.setupDiscovery');
	if (locals.discovered == undefined) {
		console.log('discovery undefined');
	}
	// locals.discovered = discoverDevicesAsync();
	locals.discoveredMap = discoveredMap;
	// locals.discoveredMap = discoverDevicesMap(locals.discovered);
};

export const handle: Handle = async ({ event, resolve }) => {
	console.debug('hooks.server.handle');
	// console.debug('event.locals', event.locals)
	//? handle discovery if this 0 request.
	setupDiscovery(event.locals);
	// event.locals.discovered = discoverDevicesAsync();
	// event.locals.discoveredMap = await discoverDevicesMap(event.locals.discovered);
	// console.log(event.locals.discoveredMap);

	if (event.url.pathname.startsWith('/api/devices')) {
		console.debug('hooks.server.handle.API.DEVICES');
		// return new Response('custom response');
		const deviceEntries = Array.from(event.locals.discoveredMap.entries());
		const serialized = deviceEntries.map(([id, device]) => {
			return device.serialize();
		});
		return new Response(JSON.stringify(serialized), {
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}

	if (event.url.pathname.startsWith('/devices') && event.isDataRequest) {
		console.debug(event);
	}
	console.debug('hooks.server.handle resolving event');
	const response = await resolve(event);
	console.debug('hooks.server.handle returning response');
	return response;
	// return resolveWithLog({ event, resolve });
};

const resolveWithLog: Handle = async ({ event, resolve }) => {
	let locals = event.locals;
	//? logging context
	let logging = locals.logLocals;
	logging.startTimer = Date.now();
	console.debug('hooks.server.resolveWithLog resolving event');
	const response = await resolve(event);
	console.debug('hooks.server.resolveWithLog returning response');
	scratchLog(response.status, event);
	return response;
};

export const handleFetch: HandleFetch = async ({ request, fetch }) => {
	console.debug('hooks.server.handleFetch');
	if (request.url.startsWith('https://api.yourapp.com/')) {
		// clone the original request, but change the URL
		request = new Request(
			request.url.replace('https://api.yourapp.com/', 'http://localhost:9999/'),
			request
		);
	}

	return fetch(request);
};

// export const handleError: HandleServerError = async ({ error, event }) => {
// 	const errorId = crypto.randomUUID();
// 	const locals = event.locals;
// 	const logLocals = locals.logLocals;

// 	//? logging context

// 	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// 	//@ts-ignore
// 	logLocals.error = error?.toString();

// 	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// 	//@ts-ignore

// 	logLocals.errorStackTrace = error?.stack || undefined;
// 	logLocals.errorId = errorId;
// 	scratchLog(500, event);
// 	return {
// 		message: 'An unexpected error occurred.',
// 		errorId
// 	};
// };
