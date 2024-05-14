import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({
	// fetch,
	locals: { discovered },
	cookies,
	params,
	route,
	isSubRequest,
	isDataRequest,
	// parent, //? layout.server.ts
	locals
}) => {
	//? LayoutData
	console.debug(`${route.id}.LayoutServerLoad ${isDataRequest} ${isSubRequest}`);
	const devices = locals.discovered.onAvailable;
	const sessionid = cookies.get('sessionid');
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
	if (isDataRequest) {
		// console.debug(fristDevice)
		// console.debug(strippedDevices)
		return {
			// data: deviceData
			// data: devices.services.map(ToDeviceRecord)
		};
	}
	return {
		devices: devices
	};
};
