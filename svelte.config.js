import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import preprocess from 'svelte-preprocess';
import { optimizeImports } from 'carbon-preprocess-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	//? Consult https://github.com/sveltejs/svelte-preprocess
	//? for more information about preprocessors
	preprocess: [
		// vitePreprocess(),
		preprocess(),
		optimizeImports()
	],
	//? adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
	//? If your environment is not supported or you settled on a specific environment, switch out the adapter.
	//? See https://kit.svelte.dev/docs/adapters for more information about adapters.
	kit: {
		adapter: adapter(),
		//? https://kit.svelte.dev/docs/hooks#server-hooks
		// files: {
		// 	serviceWorker: 'src/service.worker.ts' // or `src/my-sw.ts`
		// },
		prerender: {
			handleMissingId: 'warn'
			// concurrency?: number,
			// entries: // Array<{param: string}>
			// crawl: true //? boolean
		}
		// env: {
		// 	// dir?: string;
		// },
	}
};

export default config;
