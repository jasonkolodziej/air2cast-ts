import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
export const GET: RequestHandler = async ({ locals, request, url, route }) => {
	request.headers.set('Content-Type', 'audio/aac');
	request.headers.set('Connection', 'keep-alive');

	// * new MediaStream
	const mediaStream = new MediaStream();
	// * new AudioBuffer
	// const audioBuffer = new AudioBuffer();

	console.log(route);
	return json(route);
};
