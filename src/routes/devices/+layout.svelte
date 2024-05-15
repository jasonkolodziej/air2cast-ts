<script lang="ts">
	import { Row, Column } from 'carbon-components-svelte';
	import type { LayoutData } from './$types';

	export let data: LayoutData;
	console.debug('layout.data', data);
</script>

{#if data.devices}
	<Row padding>
		<Column>
			<h1>Devices</h1>
		</Column>
	</Row>
{/if}

<slot />
