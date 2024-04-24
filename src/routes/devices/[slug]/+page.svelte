<script lang="ts">
	import { Column, Row } from "carbon-components-svelte";
    import type { PageData } from './$types';
	import DeviceDetails from "$lib/device/DeviceDetails.svelte";
	export let data: PageData;
  console.log(data.data);
</script>

<Row padding>
  <Column>
    <h1>Device Details</h1>
  </Column>
</Row>

<Row>
  <Column>
    <DeviceDetails deviceData={data.data}/>
  </Column>
</Row>


<Row padding>
  <Column>
    <h1 id="configure">Configure</h1>
  </Column>
</Row>

<Row>
  <Column>
      <slot name="configuration">

      </slot>
    <!-- <Configuration items={data.data}/> -->
  </Column>
</Row>




<!-- <Configuration items={data.data}/> -->