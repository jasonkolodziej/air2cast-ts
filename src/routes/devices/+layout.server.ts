// import type { ReadonlyDevice } from '../../hooks.client';
import type { Device } from '$lib/server/devices/device';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = (async ({
	// fetch,
	locals: { discovered, discoveredMap },
	cookies,
	params: { device },
	route,
	isSubRequest,
	isDataRequest,
	parent //? layout.server.ts
}) => {
	//? LayoutData
	console.debug(`${route.id}.LayoutServerLoad ${isDataRequest} ${isSubRequest}`);
	// discovered.onAvailable((dev) => {
	// 	console.debug(dev);
	// });
	const sessionid = cookies.get('sessionid');
	// const deviceIds = Array.from(locals.discoveredMap.keys());
	// console.debug('ids', deviceIds);
	// let devices = new Map<string, Device>();
	// if (discovered === undefined) {
	// 	console.log('LayoutLoad!!!! discovery undefined');
	// }
	// discovered.onAvailable((a) => {
	// 	devices = devices.set(a.id, a);
	// 	// a.onReceiver(async (r) => {
	// 	// 	const vol = (await r.getVolume()).unwrapAndThrow();
	// 	// 	console.debug('VOLUME', vol);
	// 	// });
	// });
	// discovered.onUpdate((n, o) => {
	// 	devices = devices.set(o.id, n);
	// });

	const deviceIds = Array.from(discoveredMap.keys());
	// const deviceValues = new Array<[string, Device]>(...Array.from(discoveredMap.entries()));
	const deviceValues = Array.from(discoveredMap.values());

	// const devicesArray = new Array<DeviceRecord>(...(devices.DeviceRecords.values()))
	// const strippedDevices = devicesArray.map(
	//     (record) => {
	//         const clean = {templateConfiguration: new Object()} as DeviceRecord;
	//         return {
	//             ...record,
	//             ...clean
	//         } as DeviceRecord;
	// });
	// const strippedDevices = Array.from(devices?.Devices).map(
	//         (device) => {
	//             const clean = {templateConfiguration: undefined} as DeviceRecord;
	//             return {
	//                 ...device.DeviceRecord,
	//                 ...clean
	//             } as DeviceRecord;
	//     });
	// const strippedDevices = devices?.DeviceRecordArray(({templateConfiguration: undefined} as DeviceRecord))
	/* 	const mainDev = Array.from(devices?.Devices);
	const deviceData = mainDev
		.filter((device) => {
			return device.DeviceRecord.Id === params.device || true;
		})
		.map((device) => {
			console.debug(device);
			return {
				deviceData: structuredClone({
					...device.DeviceRecord,
					...({ templateConfiguration: undefined } as DeviceRecord)
				}),
				deviceStatus: device.Status()
			};
		}); */
	// const strippedDevices = mainDev?.map(device => {
	//     return {
	//         deviceData: structuredClone({
	//             ...device.DeviceRecord,
	//             ...({templateConfiguration: undefined} as DeviceRecord),
	//         }),
	//         deviceStatus: device.Status(),
	//         // receiver: structuredClone(device.CastController.receiver)
	//     }
	// })
	// const controllers = mainDev.map((device) => device.CastController);
	// const firstController = controllers.at(0);
	// const fristDevice = mainDev.at(0);
	// const status =  await fristDevice?.Status();
	// get the volume from the chromecast and unwrap the result
	// const volume = (await firstController?.receiver?.getVolume()).unwrapAndThrow()

	console.debug(deviceIds);
	const devices = new Array<Device>(...Array.from(discoveredMap.values()));
	const devicesRoutes = new Array<{ title: string; device: string; href: string }>();
	devices?.forEach((device) => {
		devicesRoutes.push({
			title: device.RecordDetails.FriendlyName as string,
			href: route.id + device.id,
			device: device.DeviceId as string
		});
	});

	if ((device as unknown as string) !== undefined) {
		// * see if the deviceId provided in params is in map?
		const maybeDevice = discoveredMap.get(device as string);
		if (maybeDevice !== undefined) {
			return {
				device: {
					id: maybeDevice.id,
					data: maybeDevice.serialize() // as object
				}
			};
		}
	}

	// const { data } = await parent();
	// const clones = devices.map((d) => d.serialize());
	// const devicesClone = structuredClone(devices);
	return { devices: devices };
}) satisfies LayoutServerLoad;
