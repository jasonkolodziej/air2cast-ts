<script lang="ts">
	import { Column, Row } from "carbon-components-svelte";
    import type { PageData } from './$types';
	import DeviceDetails from "$lib/device/DeviceDetails.svelte";
	export let data: PageData;
</script>

<Row padding>
    <Column>
      <h1>Device Details</h1>
    </Column>
  </Row>
<Row>
    <Column>
        <!-- <DeviceDetails {data.device}/> -->
    </Column>
</Row>


<Row padding>
    <Column>
      <h1>Configure</h1>
    </Column>
</Row>

<Row>
  <Column>
    <!-- <Configuration items={data.data}/> -->
  </Column>
</Row>