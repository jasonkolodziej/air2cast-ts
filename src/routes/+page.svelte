<script lang="ts">
	import Configuration from "$lib/configuration/Configuration.svelte";
	import { Form, Checkbox, Button, Column, Row } from "carbon-components-svelte";
    import type { PageData } from './$types';
	import Device from "$lib/device/Device.svelte";
	import DeviceDetails from "$lib/device/DeviceDetails.svelte";
  export let data: PageData;
</script>

<!-- <pre>{data.sections}</pre> -->
<Row>
  <Column>
<h1>Welcome to IBM</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
</Column>
</Row>
<!-- <Space/> -->
<!-- <Row padding>
  <Column>
    <h1>Devices</h1>
  </Column>
</Row>

<Row>
  <Column padding><Device/></Column>
  <Column padding ><Device/></Column>
  <Column padding ><Device/></Column>
  <Column padding ><Device/></Column>
</Row> -->




<!-- <Row>
  <Column>
    <Configuration items={data.pageData.data}/>
  </Column>
</Row> -->


