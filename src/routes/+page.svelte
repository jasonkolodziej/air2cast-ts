<script lang="ts">
	import Configuration from "$lib/configuration/Configuration.svelte";
	import { Form, Checkbox, Button, Column, Row } from "carbon-components-svelte";
    import type { PageData } from './$types';
	import Device from "$lib/device/Device.svelte";
  export let data: PageData;
</script>

<!-- <pre>{data.sections}</pre> -->
<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<!-- <Space/> -->
<h2>Devices</h2>
<Row>
  <Column>
    <Device></Device>
  </Column>
  <Column><Device></Device></Column>
  <Column>Column</Column>
  <Column>Column</Column>
</Row>

<h3>Configure</h3>

<Configuration items={data.pageData.data}/>