// ? https://kit.svelte.dev/docs/hooks#server-hooks
import { discoverDevices } from '$lib/server/devices/devices.server';
import scratchLog from '$lib/server/service/scratchLogging';
import { type Handle, type HandleFetch, type HandleServerError, type RequestEvent } from '@sveltejs/kit';

const setupDiscovery = (event:RequestEvent):void => {
	console.debug('hooks.server.setupDiscovery');
	const locals = event.locals;
	locals.discovered = locals.discovered ?? discoverDevices();
}

export const handle: Handle = async ({ event, resolve }) => {
    console.debug("hooks.server.handle");
	// console.debug('event.locals', event.locals)
	//? handle discovery if this 0 request.
	setupDiscovery(event);

	if (event.url.pathname.startsWith('/custom')) {
		return new Response('custom response');
	}

	if (event.url.pathname.startsWith('/devices') && event.isDataRequest) {
		console.debug(event);
	}
	// console.debug('hooks.server.handle resolving event')
	// const response = await resolve(event);
	// console.debug('hooks.server.handle returning response')
	return resolveWithLog({event, resolve});
};

const resolveWithLog: Handle = async ({event, resolve}) => {
	const locals = event.locals;
	//? logging context
	const logging = locals.logLocals;
	logging.startTimer = Date.now();
	console.debug('hooks.server.resolveWithLog resolving event');
	const response = await resolve(event);
	console.debug('hooks.server.resolveWithLog returning response');
	scratchLog(response.status, event);
	return response;
}

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

export const handleError: HandleServerError = async ({ error, event }) => {
	const errorId = crypto.randomUUID();
	const locals = event.locals;

	//? logging context
	const logging = locals.logLocals;
   
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	//@ts-ignore
	logging.error = error?.toString() || undefined;
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	//@ts-ignore
	logging.errorStackTrace = error?.stack || undefined;
	logging.errorId = errorId;
	scratchLog(500, event);
	return {
	 	message: 'An unexpected error occurred.',
	 	errorId
	};
   };