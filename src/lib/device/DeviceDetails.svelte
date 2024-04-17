<script lang="ts">
    import { ContentSwitcher, Switch, Button, Toggle, 
        Breadcrumb, BreadcrumbItem,
         CodeSnippet, Column, Row } from "carbon-components-svelte";

    let toggled = false;
    let selectedIndex = 1;
    $: length = toggled ? 1000 : 10;
    $: code = Array.from({ length }, (_, i) => i + 1).join("\n");
</script>

<Row padding>
    <Column>
        <h2>Information</h2>
        <br/>
        <Breadcrumb>
            <BreadcrumbItem href="/">Devices</BreadcrumbItem>
            <BreadcrumbItem href="/reports/2019" isCurrentPage>DeviceName</BreadcrumbItem>
        </Breadcrumb>
    </Column>
    <Column>
        <h2>Logs</h2>
    <br/>
        <ContentSwitcher bind:selectedIndex>
            <Switch text="General" />
            <Switch text="Chromecast" />
            <Switch text="Shairport Sync" />
            <Switch text="Transcoder" />
        </ContentSwitcher>
    </Column>
</Row>
<Row>
    <Column aspectRatio="2x1">
    </Column>
    <Column aspectRatio="2x1">
        <Toggle
        bind:toggled
        size="sm"
        labelText="Trigger snippet overflow"
        style="margin-bottom: var(--cds-spacing-05)"
    />
    <CodeSnippet 
        wrapText
        type="multi" 
        copy={() => {}} 
        showMoreText="Expand"
        showLessText="Collapse"
        {code}>
    </CodeSnippet>
    <div>
        <Button
            size="small"
            disabled={selectedIndex === 2}
            on:click={() => (selectedIndex = 2)}>
            Set selected to 2
        </Button>
        </div>
          
        <div>Selected index: {selectedIndex}</div>
    </Column>
</Row>




<!-- <CodeSnippet 
    type="multi" 
    {code} 
    showMoreText="Expand"
    showLessText="Collapse"
    /> -->



  
<style>
    div {
        margin-top: var(--cds-spacing-05);
    }
</style>
  