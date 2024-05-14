<script lang="ts">
	import { Button, ExpandableTile, Tag, DataTable } from 'carbon-components-svelte';
	import { CatalogPublish, Checkmark, Events, PlayFilled, Settings } from 'carbon-icons-svelte';
	import type { ReceiverStatus } from '@foxxmd/chromecast-client';
	import type { DeviceOb } from '../../routes/devices/+page.server';
	// interface device {
	//   deviceData: DeviceRecord;
	//   deviceStatus: ReceiverStatus;
	//   // route: string;
	// }
	export let device: DeviceOb;
	export const deviceData: DeviceOb = device;
	export let deviceStatus: ReceiverStatus = device?.Client;
	export let routeId: string;
	export let deviceType: string = deviceData?.Type as string;
	let aopen = false;
	let open = false;
	let selected = 0;
	//? Data Table
	let expandedRowIds = [];
	let selectedRowIds = [];
	let filteredRowIds = [];
	let shorterRows = [];
	let pageSize = 5;
	let page = 1;
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
		<a href={routeId + '/' + deviceData?.DeviceId}>
			<h4>{deviceData?.FriendlyName}</h4>
		</a>

		{#if deviceType !== 'group'}
			<Tag type="green" icon={Checkmark}>Active</Tag>
			<Tag type="high-contrast">Deactivated</Tag>
		{/if}
		{#await deviceStatus then result}
			{#if result.applications !== undefined}
				<Tag type="cyan" icon={PlayFilled}>In Use</Tag>
			{/if}
		{/await}
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
				{ id: 'a', detail: 'Address', val: deviceData?.Address.host },
				{ id: 'b', detail: 'Port Number', val: deviceData?.Address.port },
				{ id: 'c', detail: 'Manufacturer Details', val: deviceData?.ManufacturerDetails }
				// {detail: "Address", val: deviceData?. }
			]}
		/>
		<br />
		<br />
		<!-- Below the fold content here -->
	</div>
</ExpandableTile>
