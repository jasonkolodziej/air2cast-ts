// ? https://kit.svelte.dev/docs/hooks#server-hooks
import type { Handle } from '@sveltejs/kit';
import {discoverChromeCast, IsTv} from '$lib/server/mdns.server';

export const handle: Handle = async ({ event, resolve }) => {
    // console.log(event);
    const cast = discoverChromeCast;
    cast.onAvailable(service => {
        console.log(service)
        IsTv(service) ? console.warn("Device is a TV") : undefined
    });
    // console.log("ll", ll);
    // cast.onAvailable();
	if (event.url.pathname.startsWith('/custom')) {
		return new Response('custom response');
	}

	const response = await resolve(event);
	return response;
};