<script lang="ts">
	import { Column, Row } from 'carbon-components-svelte';
	import type { PageData } from './$types';
	import Device from '$lib/device/Device.svelte';
	import type { DeviceService } from '$lib/server/devices/device';
	export let data: PageData;
	const devices: Array<DeviceService> = data?.devices as Array<DeviceService>;
	// $:({data:{promise}}=data)
	// console.debug('page data', data);
</script>

{#if devices.length > 0}
	<Row>
		{#each devices as device}
			<Column padding>
				<Device {device} />
				<!-- <Device {device} /> // routeId={data.route} -->
				<!-- <Device routeId={data.route} deviceData={device.deviceData}/> -->
			</Column>
		{/each}
	</Row>
{/if}
