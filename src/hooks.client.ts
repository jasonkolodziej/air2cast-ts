// import type { Handle } from "@sveltejs/kit";

import type { DeviceService, RecordDetails } from '$lib/server/devices/device';
import type { ReceiverController } from '@foxxmd/chromecast-client';
import type { AsyncSubscribable } from 'atvik';
import type { HostAndPort } from 'tinkerhub-discovery';

// export const handle: Handle = async ({ event, resolve }) => {

// };

// export interface ReadonlyDevice extends DeviceService {
// 	readonly onReceiver: AsyncSubscribable<this, [ReceiverController.Receiver]>;
// 	readonly Address?: HostAndPort;
// 	readonly RecordDetails: RecordDetails;
// }
