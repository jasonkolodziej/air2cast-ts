// import type { Handle } from "@sveltejs/kit";

import type { DeviceService, RecordDetails } from '$lib/server/devices/device';

// export const handle: Handle = async ({ event, resolve }) => {

// };

export interface DeviceOb extends DeviceService, RecordDetails {}
