<script lang="ts">
	import Configuration from "$lib/configuration/Configuration.svelte";
	import { Form, Checkbox, Button } from "carbon-components-svelte";
    import type { PageData } from './$types';
  export let data: PageData;
</script>

<!-- <pre>{data.sections}</pre> -->
<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<!-- <Space/> -->
<h2>Configure</h2>

<Configuration items={data.pageData.data}/>