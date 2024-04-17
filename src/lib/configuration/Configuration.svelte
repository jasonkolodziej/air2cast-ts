<script lang="ts">
    // import { jsonConfiguration } from '$lib/server/libconfig.server'
	import { Form, Checkbox, Button, Accordion, AccordionItem } from 'carbon-components-svelte';
    // import {dataArray} from '$lib/server/libconfig.server'

    let open = false;
    export let items:Array<object> = []
</script>

<!-- <Configuration> -->
    <Form
    on:submit={(e) => {
      e.preventDefault();
      console.log("submit", e);
    }}
  >
  <Button kind="ghost" size="field" on:click={() => (open = !open)}>
      {open ? "Collapse" : "Expand"}
      all
    </Button>
    
    <Accordion>
      {#each items as item}
        <AccordionItem title={item.title ?? item.name} {open}>
          <p>{item.description}</p>
        </AccordionItem>
      {/each}
    </Accordion>
    <Checkbox id="checkbox-0" labelText="Checkbox Label" checked />
    <Button type="submit">Submit</Button>
  </Form>
<!-- </Configuration> -->

