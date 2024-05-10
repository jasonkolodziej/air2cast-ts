//? See https://kit.svelte.dev/docs/types#app
//? import type { env } from "$env/dynamic/private";
//? for information about these interfaces

import type { Device } from "$lib/server/devices/device";
import type { ServiceDiscovery } from "tinkerhub-discovery";

declare global {
	namespace App {
		// set(env, )
		interface Error {
			code?: string;
			errorId?: string;
		}
		interface Locals {
			// user: Lucia.UserAttributes;

			//? Refer to `$lib/server/service/scratchLogging.ts`
			logLocals: ScratchLogging.LoggingLocals;
			discovered: ServiceDiscovery<Device>
		}
		// interface PageData {}
		// interface PageState {}
		interface Platform {}
	}

	//? Refer to `$lib/server/service/scratchLogging.ts`
	//? [Github](https://github.com/delay/sveltekit-auth-starter/blob/67a6890caca552a6cc717bdebb0d14f85a6834df/src/app.d.ts#L22C1-L35C2)
	namespace ScratchLogging {
		type LoggingLocals = {
			startTimer: number;
			error: string;
			errorId: string;
			errorStackTrace: string;
			message: unknown;
			track: unknown;
		};
	}
}

export {};
