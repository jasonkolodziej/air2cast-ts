<script lang="ts">
	import { Column, Row } from 'carbon-components-svelte';
	import type { PageData } from './$types';
	import DeviceDetails from '$lib/device/DeviceDetails.svelte';
	import type { DeviceService } from '$lib/server/devices/device';
	import Configuration from '$lib/configuration/Configuration.svelte';
	export let data: PageData;
	const device: DeviceService = data?.device?.data as unknown as DeviceService;
	console.log(data);
</script>

<Row padding>
	<Column>
		<h1>Device Details</h1>
	</Column>
</Row>

<Row>
	<Column>
		<DeviceDetails {device} />
	</Column>
</Row>

<Row padding>
	<Column>
		<h1 id="configure">Configure</h1>
	</Column>
</Row>

<Row>
	<Column>
		<!-- <Configuration items={} /> -->
	</Column>
</Row>
