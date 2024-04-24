<script lang="ts">
	import { Column, Row } from "carbon-components-svelte";
  import type { PageData } from './$types';
	import Device from "$lib/device/Device.svelte";
	export let data: PageData;
  // $:({data:{promise}}=data)
  console.debug('page data', data.data)
</script>

<!-- {#if data.data.data} -->
<Row >
  {#each data.data as device}
    <Column padding ><Device routeId={data.route} deviceData={device}/></Column>
  {/each}
</Row>
<!-- {/if} -->



