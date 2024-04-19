<script lang="ts">
	import { Column, Row } from "carbon-components-svelte";
    import type { PageData } from './$types';
	import Device from "$lib/device/Device.svelte";
	import { setContext } from "svelte";
	export let data: PageData;
  $:({stream:{promise}}=data)
  // console.debug('page data', data.stream.promise.then)
</script>

<Row padding>
    <Column>
      <h1>Devices</h1>
    </Column>
    <Column>
      {#await promise}
      <p>wait</p>
  {:then data} 
      <p>{data}</p>
  {/await}
    </Column>
</Row>
  
  <Row>
    <Column padding><Device/></Column>
    <Column padding ><Device/></Column>
    <Column padding ><Device/></Column>
    <Column padding ><Device/></Column>
  </Row>