<script lang="ts">
	import { Column, Row } from 'carbon-components-svelte';
	import type { PageData } from './$types';
	import DeviceDetails from '$lib/device/DeviceDetails.svelte';
	// import Configuration from '$lib/configuration/Configuration.svelte';
	export let data: PageData;
	console.log(data);
</script>

<Row padding>
	<Column>
		<h1>Device Details</h1>
	</Column>
</Row>

<Row>
	<Column>
		<DeviceDetails device={data?.device?.data} />
	</Column>
</Row>

<Row padding>
	<Column>
		<h1 id="configure">Configure</h1>
	</Column>
</Row>

<Row>
	<Column>
		<!-- <Configuration items={data.devices} /> -->
	</Column>
</Row>
