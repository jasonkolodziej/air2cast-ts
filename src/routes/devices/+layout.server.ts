import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({
	params: { deviceId },
	// data, //? LayoutServerData
	route,
	parent,
	locals: { discoveredMap }
}) => {
	// const pData = await parent();
	console.debug(`${route.id}.LayoutLoad=@[${deviceId}]={DEVICES}`);
	const deviceVals = Array.from(discoveredMap.values());
	const devices = deviceVals.map((d) => d.serialize());
	return {
		devices: devices
	};
	// return data;
};
