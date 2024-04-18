<script lang="ts">
	import { Column, Row } from "carbon-components-svelte";
    import type { PageData } from './$types';
	import Device from "$lib/device/Device.svelte";
	export let data: PageData;
</script>

<Row padding>
    <Column>
      <h1>Devices</h1>
    </Column>
</Row>
  
  <Row>
    <Column padding><Device/></Column>
    <Column padding ><Device/></Column>
    <Column padding ><Device/></Column>
    <Column padding ><Device/></Column>
  </Row>