<script lang="ts">
    import { Button, ExpandableTile, ButtonSet, Tag,
    Accordion, AccordionItem, DataTable } from 'carbon-components-svelte';
      import { CatalogPublish, Checkmark, Information, PlayFilled, Settings } from 'carbon-icons-svelte';
      import type { KV } from '../../routes/+page.server';
        export let items:Array<{title: string; description: string[]; children: Map<string, KV>}> = []
  
    let aopen = false;
    let open = false;
    let selected = 0;
    //? Data Table
    let expandedRowIds = [];
    let selectedRowIds = [];
    let filteredRowIds = [];
    let shorterRows = [];
    let pageSize = 5;
    let page = 1;
    $: {
      console.log("expandedRowIds", expandedRowIds);
      console.log("selectedRowIds", selectedRowIds);
      console.log("filteredRowIds", filteredRowIds);
    }
  </script>

<ExpandableTile tileExpandedLabel="View less" tileCollapsedLabel="View more">
    <div slot="above">
      <a
        href="/"
        on:click|preventDefault|stopPropagation={
        () => console.log("Hello world")}>
        <h4>Device Name</h4>
        </a>
      
      <Tag type="green" icon={Checkmark}>Active</Tag>
      <Tag type="high-contrast">Deactivated</Tag>
      <Tag type="cyan"  icon={PlayFilled}>In Use</Tag>
<br /><br />
      <!-- <ButtonSet stacked> -->
        <Button
        icon={Settings}
        iconDescription="Configure"
        tooltipAlignment="start"
        tooltipPosition="top"
        size="small"
        on:click={(e) => {
          e.stopPropagation();
          console.log("Hello world");
        }}>
      </Button>
        <Button
          kind="ghost"
          icon={CatalogPublish}
          size="small"
          on:click={(e) => {
            e.stopPropagation();
            console.log("Hello world");
          }}>
          Logs
        </Button>
        <br/>
        <br/>
      <!-- </ButtonSet> -->
      
      <!-- <svelte:fragment slot="skip-to-content"> -->
        <!-- <SkipToContent /> -->
      <!-- </svelte:fragment> -->
    </div>
    <div slot="below">
        <br/>
        <DataTable
        size="compact"
        headers={[
          { key: "name", value: "Name" },
          { key: "protocol", value: "Protocol" },
        ]}
        rows={[
          {
            id: "a",
            name: "Load Balancer 3",
          },
          {
            id: "b",
            name: "Load Balancer 1",
            protocol: "HTTP",
            port: 443,
            rule: "Round robin",
          },
          {
            id: "c",
            name: "Load Balancer 2",
            protocol: "HTTP",
            port: 80,
            rule: "DNS delegation",
          },
          {
            id: "d",
            name: "Load Balancer 6",
            protocol: "HTTP",
            port: 3000,
            rule: "Round robin",
          },
          {
            id: "e",
            name: "Load Balancer 4",
            protocol: "HTTP",
            port: 443,
            rule: "Round robin",
          },
          {
            id: "f",
            name: "Load Balancer 5",
            protocol: "HTTP",
            port: 80,
            rule: "DNS delegation",
          },
        ]}
      />
      <br/>
      <br/>
        <!-- Below the fold content here -->
    </div>
  </ExpandableTile>
  
  