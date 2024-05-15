<script lang="ts">
	import { Button, ExpandableTile, Tag, DataTable } from 'carbon-components-svelte';
	import { CatalogPublish, Checkmark, Events, PlayFilled, Settings } from 'carbon-icons-svelte';
	import type { RecordDetails, DeviceService } from '$lib/server/devices/device';

	export let device: DeviceService | undefined;
	export const deviceData: DeviceService = device!;
	export const deviceDataDetails: RecordDetails = deviceData?.RecordDetails;
	// export let deviceStatus: ReceiverStatus = device?.onReceiver(async (r: Reciever) => {
	// 	(await r.getStatus()).unwrapAndThrow();
	// });
	export const routeId: string = '/device';
	export let deviceType: string = deviceData?.Type as string;
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
		<a href={routeId + '/' + deviceData.id}>
			<h4>{deviceDataDetails?.FriendlyName}</h4>
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
			href={routeId + '/' + deviceData?.id + '#configure'}
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
				{ id: 'a', detail: 'Address', val: deviceData?.Address?.host },
				{ id: 'b', detail: 'Port Number', val: deviceData?.Address?.port },
				{ id: 'c', detail: 'Manufacturer Details', val: deviceDataDetails?.ManufacturerDetails }
				// {detail: "Address", val: deviceData?. }
			]}
		/>
		<br />
		<br />
		<!-- Below the fold content here -->
	</div>
</ExpandableTile>
