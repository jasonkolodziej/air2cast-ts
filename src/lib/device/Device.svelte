<script lang="ts">
    import { Button, ExpandableTile, ButtonSet,
    Accordion, AccordionItem } from 'carbon-components-svelte';
      import { CatalogPublish, Settings } from 'carbon-icons-svelte';
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
      <!-- </ButtonSet> -->
      
      <!-- <svelte:fragment slot="skip-to-content"> -->
        <!-- <SkipToContent /> -->
      <!-- </svelte:fragment> -->
    </div>
    <div slot="below">
        <br/>
        <!-- <Accordion align="start" slot="below">
            <AccordionItem title="Natural Language Classifier" open={aopen}>
              <p>
                Natural Language Classifier uses advanced natural language processing and
                machine learning techniques to create custom classification models. Users
                train their data and the service predicts the appropriate category for the
                inputted text.
              </p>
            </AccordionItem>
          </Accordion> -->
        Below the fold content here
    </div>
  </ExpandableTile>
  
  