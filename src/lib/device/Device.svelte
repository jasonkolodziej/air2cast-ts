<script lang="ts">
	import { Button, ExpandableTile, Tag, DataTable } from 'carbon-components-svelte';
	import { CatalogPublish, Checkmark, Events, PlayFilled, Settings } from 'carbon-icons-svelte';
	// import type { ReceiverStatus } from '@foxxmd/chromecast-client';
	import type { ReadonlyDevice } from '../../hooks.client';
	import type { RecordDetails } from '$lib/server/devices/device';

	export let device: ReadonlyDevice;
	export const deviceData: RecordDetails = device.RecordDetails;
	// export let deviceStatus: ReceiverStatus = device?.onReceiver(async (r: Reciever) => {
	// 	(await r.getStatus()).unwrapAndThrow();
	// });
	export let routeId: string;
	export let deviceType: string = device.Type as string;
	//? Data Table
	const headers = [
		{ key: 'detail', value: 'Detail' },
		{ key: 'val', value: '' }
	];
	// console.log(deviceStatus);
	// console.assert(deviceStatus?.applications !== undefined);
	// let rows:Array<{id: string; detail: string; val: any;}> =
	// $: {
	//   console.log("expandedRowIds", expandedRowIds);
	//   console.log("selectedRowIds", selectedRowIds);
	//   console.log("filteredRowIds", filteredRowIds);
	// }
</script>

<ExpandableTile tileExpandedLabel="View less" tileCollapsedLabel="View more">
	<div slot="above">
		<!-- <a
        href={routeId+'/'+deviceData?.Id}
        on:click|preventDefault|stopPropagation={
        () => console.log("Hello world")}> -->
		<a href={routeId + '/' + device.DeviceId}>
			<h4>{deviceData?.FriendlyName}</h4>
		</a>

		{#if deviceType !== 'group'}
			<Tag type="green" icon={Checkmark}>Active</Tag>
			<Tag type="high-contrast">Deactivated</Tag>
		{/if}
		<!-- {#await deviceStatus then result}
			{#if result.applications !== undefined}
				<Tag type="cyan" icon={PlayFilled}>In Use</Tag>
			{/if}
		{/await} -->
		{#if deviceType === 'group'}
			<Tag icon={Events}></Tag>
		{/if}
		<br /><br />
		<!-- <ButtonSet stacked> -->
		<Button
			icon={Settings}
			iconDescription="Configure"
			tooltipAlignment="start"
			tooltipPosition="top"
			size="small"
			href={routeId + '/' + deviceData?.Id + '#configure'}
		></Button>
		<Button
			kind="ghost"
			icon={CatalogPublish}
			size="small"
			on:click={(e) => {
				e.stopPropagation();
				console.log('Hello world');
			}}
		>
			Logs
		</Button>
		<br />
		<br />
		<!-- </ButtonSet> -->

		<!-- <svelte:fragment slot="skip-to-content"> -->
		<!-- <SkipToContent /> -->
		<!-- </svelte:fragment> -->
	</div>
	<div slot="below">
		<br />
		<DataTable
			size="compact"
			{headers}
			rows={[
				{ id: 'a', detail: 'Address', val: device?.Address?.host },
				{ id: 'b', detail: 'Port Number', val: device?.Address?.port },
				{ id: 'c', detail: 'Manufacturer Details', val: deviceData?.ManufacturerDetails }
				// {detail: "Address", val: deviceData?. }
			]}
		/>
		<br />
		<br />
		<!-- Below the fold content here -->
	</div>
</ExpandableTile>
