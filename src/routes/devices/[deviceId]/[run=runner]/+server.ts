import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { DefaultMediaApp } from '@foxxmd/chromecast-client';

export const GET: RequestHandler = async ({
	locals,
	request,
	url,
	route,
	params: { deviceId, run }
}) => {
	const device = locals.discoveredMap.get(deviceId);
	if (device === undefined) {
		return error(500);
	}
	const newUrl = String(url).replace('/' + run, '/stream');
	switch (run) {
		case 'connect':
			// const status = (await device.Receiver?.getStatus())?.unwrapAndThrow();
			//return new Response(json(status));
			//* launch the media app on the Chromecast and join the session (so we can control the CC)
			const media = (
				await DefaultMediaApp.launchAndJoin({ client: device.Client })
			).unwrapWithErr(); //.then(Result.unwrapWithErr);
			//* if the media app failed to load, log the error
			// if (!media.isOk) return error(404, media.value);
			//* queue up a couple of videos
			// await media.value.queueLoad({
			// 	items: [
			// 		{
			// 			media: {
			// 				// contentId: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4',
			// 				contentId: ,
			// 				contentType: 'audio/aac',
			// 				streamType: 'LIVE' // BUFFERED
			// 			}
			// 		}
			// 	]
			// });

			return json({ newUrl, status });
			break;
		case 'disconnect':
			const status = (await device.Receiver?.getStatus())?.unwrapAndThrow();

		default:
			return error(500, `No route ${url}`);
	}
};
