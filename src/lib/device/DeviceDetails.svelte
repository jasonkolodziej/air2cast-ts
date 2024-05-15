<script lang="ts">
	// import type { DeviceRecord } from "$lib/server/mdns.server";
	import { json } from '@sveltejs/kit';
	import {
		ContentSwitcher,
		Switch,
		Button,
		Toggle,
		Breadcrumb,
		BreadcrumbItem,
		CodeSnippet,
		Column,
		Row
	} from 'carbon-components-svelte';
	import type { ReadonlyDevice } from '../../hooks.client';

	export let deviceData: ReadonlyDevice | undefined;

	let toggled = false;
	let selectedIndex = 1;
	$: length = toggled ? 1000 : 10;
	$: code = JSON.stringify(deviceData, null, 4);
</script>

<Row padding>
	<Column>
		<h2>Information</h2>
		<br />
		<Breadcrumb>
			<BreadcrumbItem href="/devices">Devices</BreadcrumbItem>
			<BreadcrumbItem href={'/devices/' + deviceData?.DeviceId} isCurrentPage
				>{deviceData?.RecordDetails.ManufacturerDetails}</BreadcrumbItem
			>
		</Breadcrumb>
	</Column>
	<Column>
		<h2>Logs</h2>
		<br />
		<ContentSwitcher bind:selectedIndex>
			<Switch text="General" />
			<Switch text="Chromecast" />
			<Switch text="Shairport Sync" />
			<Switch text="Transcoder" />
		</ContentSwitcher>
	</Column>
</Row>
<Row>
	<Column aspectRatio="2x1">
		<CodeSnippet
			wrapText
			type="multi"
			copy={() => {}}
			showMoreText="Expand"
			showLessText="Collapse"
			{code}
		></CodeSnippet>
	</Column>
	<Column aspectRatio="2x1">
		<Toggle
			bind:toggled
			size="sm"
			labelText="Trigger snippet overflow"
			style="margin-bottom: var(--cds-spacing-05)"
		/>
		<CodeSnippet
			wrapText
			type="multi"
			copy={() => {}}
			showMoreText="Expand"
			showLessText="Collapse"
			{code}
		></CodeSnippet>
		<div>
			<Button size="small" disabled={selectedIndex === 2} on:click={() => (selectedIndex = 2)}>
				Set selected to 2
			</Button>
		</div>

		<div>Selected index: {selectedIndex}</div>
	</Column>
</Row>

<!-- <CodeSnippet 
    type="multi" 
    {code} 
    showMoreText="Expand"
    showLessText="Collapse"
    /> -->

<style>
	div {
		margin-top: var(--cds-spacing-05);
	}
</style>
