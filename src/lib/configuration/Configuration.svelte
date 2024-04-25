<script lang="ts">
  import { DataTable, Toolbar, ToolbarBatchActions, ToolbarContent, ToolbarMenu, ToolbarMenuItem, ToolbarSearch } from "carbon-components-svelte";
	import { Form,Button, ExpandableTile, CodeSnippet, // Icon,
    Tabs, Tab, TabContent } from 'carbon-components-svelte';
    import { Save, CheckmarkFilled } from 'carbon-icons-svelte';
	import type { KV } from '../../routes/+page.server';
	export let items:Array<{title: string; description: string[]; children: Map<string, KV>}> = []

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

<!-- <Configuration> -->
    <Form
    on:submit={(e) => {
      e.preventDefault();
      console.log("submit", e);
    }}
  >
  <!-- <Button kind="ghost" size="field" on:click={() => (open = !open)}>
      {open ? "Collapse" : "Expand"}
      all
    </Button> -->

    <Tabs autoWidth bind:selected>
      {#each items as item}
        <Tab label={item.title} />
        {/each}
      <svelte:fragment slot="content">
      {#each items as item}
      <TabContent>
        <DataTable
          sortable
          batchExpansion
          batchSelection
          bind:expandedRowIds
          bind:selectedRowIds
          headers={[
            { key: "name", value: "Name" },
            { key: "icon", value: "Active", sort: (a, b) => b - a, },
            { key: "_value", value: "Value" },
            { key: "type", value: "Type" },
            { key: "_description", value: "Description" },
            // { key: "port", value: "Port" },
            // { key: "rule", value: "Rule" },
          ]}
          rows={Array.from(item.children).map(([_key, _val], i) => 
            {
              // if (!_val._description._isCommented) {
              //   selectedRowIds.push(i);
              // }
              shorterRows.push({
                id: i,
                name: (_key.replaceAll('_', ' ')),
                _value: _val._value,
                // port: i % 3 ? (i % 2 ? 3000 : 80) : 443,
                // rule: i % 3 ? "Round robin" : "DNS delegation"
              });
              return {
                id: i,
                name: (_key.replaceAll('_', ' ')),
                icon: (!_val._description._isCommented) ? true : false,
                _value: _val._value,
                type:  _val['$type'],
                _description: _val._description._description
                // port: i % 3 ? (i % 2 ? 3000 : 80) : 443,
                // rule: i % 3 ? "Round robin" : "DNS delegation"
              }
            }
          )}
        >
          <svelte:fragment slot="expanded-row" let:row>
            <CodeSnippet 
              wrapText
              type="multi" 
              copy={() => {}} 
              showMoreText="Expand"
              showLessText="Collapse">
              {JSON.stringify(row, null, 9)}
            </CodeSnippet>
            <!-- <pre> </pre> -->
          </svelte:fragment>
        
        <strong slot="title">{item.title}</strong>
        <span slot="description">
        <ExpandableTile tileExpandedLabel="View less" tileCollapsedLabel="View more">
          <span slot="above">{item.description.at(0)}</span>
            <div slot="below">{item.description.filter((_,i) => i != 0)}</div>
        </ExpandableTile>
        </span>

        <Toolbar>
          <ToolbarBatchActions>
            <Button icon={Save}>Save</Button>
          </ToolbarBatchActions>
          <ToolbarContent>
            <ToolbarSearch
              persistent
              bind:filteredRowIds
              value=""
              shouldFilterRows/>
            <ToolbarMenu>
              <ToolbarMenuItem primaryFocus>Restart all</ToolbarMenuItem>
              <ToolbarMenuItem href="https://cloud.ibm.com/docs/loadbalancer-service">
                API documentation
              </ToolbarMenuItem>
              <ToolbarMenuItem hasDivider danger>Stop all</ToolbarMenuItem>
            </ToolbarMenu>
            <Button>Find</Button>
          </ToolbarContent>
        </Toolbar>
    </DataTable>

    </TabContent>
    {/each}
    </svelte:fragment>
    </Tabs>
    
    <!-- <div style="margin: var(--cds-layout-01) 0">
      <Button on:click={() => (selected = 1)}>Set index to 1</Button>
    </div>
    
    <strong>Selected index:</strong>
    {selected} -->

    <Button type="submit">Submit</Button>
  </Form>
<!-- </Configuration> -->

