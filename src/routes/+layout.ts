/* This file was created by inlang.
It is needed in order to circumvent a current limitation of SvelteKit. See https://github.com/inlang/inlang/issues/647
You can remove this comment and modify the file as you like. We just need to make sure it exists.
Please do not delete it (inlang will recreate it if needed). */
import type { LayoutLoad } from './$types';

/**
	### `(group)`
	Perhaps you have some routes that are 'app' routes that should have one layout (e.g. /dashboard or /item), 
	and others that are 'marketing' routes that should have a different layout (/about or /testimonials). 
	We can group these routes with a directory whose name is wrapped in parentheses — unlike normal directories, 
	(app) and (marketing) do not affect the URL pathname of the routes inside them:
	```shell
		src/routes/
		│ (app)/
		│ ├ dashboard/
		│ ├ item/
		│ └ +layout.svelte
		│ (marketing)/
		│ ├ about/
		│ ├ testimonials/
		│ └ +layout.svelte
		├ admin/
		└ +layout.svelte
	```
	You can also put a +page directly inside a (group), for example if / should be an (app) or a (marketing) page.
	### `+page@`
	Pages can break out of the current layout hierarchy on a route-by-route basis. 
	Suppose we have an /item/[id]/embed route inside the (app) group from the previous example:
	```shell
		src/routes/
		├ (app)/
		│ ├ item/
		│ │ ├ [id]/
		│ │ │ ├ embed/
		│ │ │ │ └ +page.svelte
		│ │ │ └ +layout.svelte
		│ │ └ +layout.svelte
		│ └ +layout.svelte
		└ +layout.svelte
	```
	Ordinarily, this would inherit the root layout, the (app) layout, the item layout and the [id] layout. 
	We can reset to one of those layouts by appending @ followed by the segment name — or, for the root layout, 
	the empty string. In this example, we can choose from the following options:
		- `+page@[id].svelte` - inherits from src/routes/(app)/item/[id]/+layout.svelte
		- `+page@item.svelte` - inherits from src/routes/(app)/item/+layout.svelte
		- `+page@(app).svelte` - inherits from src/routes/(app)/+layout.svelte
		- `+page@.svelte` - inherits from src/routes/+layout.svelte
	```shell
		src/routes/
		├ (app)/
		│ ├ item/
		│ │ ├ [id]/
		│ │ │ ├ embed/
	   +│ │ │ │ └ +page@(app).svelte
		│ │ │ └ +layout.svelte
		│ │ └ +layout.svelte
		│ └ +layout.svelte
		└ +layout.svelte
	```
	### `+layout@`
	Like pages, layouts can themselves break out of their parent layout hierarchy, using the same technique. 
	For example, a +layout@.svelte component would reset the hierarchy for all its child routes.
	```(shell)
		src/routes/
		├ (app)/
		│ ├ item/
		│ │ ├ [id]/
		│ │ │ ├ embed/
		│ │ │ │ └ +page.svelte  // uses (app)/item/[id]/+layout.svelte
		│ │ │ ├ +layout.svelte  // inherits from (app)/item/+layout@.svelte
		│ │ │ └ +page.svelte    // uses (app)/item/+layout@.svelte
		│ │ └ +layout@.svelte   // inherits from root layout, skipping (app)/+layout.svelte
		│ └ +layout.svelte
		└ +layout.svelte
	```
*/
const toProperCase = (str: string) => str.charAt(0).toUpperCase() + str.substring(1);

export const load: LayoutLoad = async ({
	// params,
	data, //? LayoutServerData from layout.server.ts
	route
}) => {
	console.debug(`${route.id}.LayoutLoad`);

	const sections: Array<{ slug: string; title: string; text: string; href: string }> = new Array();
	data.data.forEach((item) =>
		sections.push({
			slug: item,
			title: toProperCase(item),
			text: toProperCase(item),
			href: '/' + item
		})
	);
	return {
		data: sections,
		sections: sections
	};
};
