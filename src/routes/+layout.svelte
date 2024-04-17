<script lang="ts">
    import "carbon-components-svelte/css/all.css";
    import Header from '$lib/header/Header.svelte';
    import {
        Content,
        Grid, Theme
    } from "carbon-components-svelte";
    import type {HeaderProps} from "carbon-components-svelte/src/UIShell/Header.svelte";
    import type { LayoutData } from './$types';
    export let data: LayoutData;
    let sideMenu = data.sections;
    let headMenu = data.sections;
    let headerVals: HeaderProps = {company: "International", platformName:"Business of Music", persistentHamburgerMenu: true, href:"/"}
</script>

<Theme
        theme="white"
        tokens={{
    "background-color": "#d02670",
  }}
>
<Header {headerVals} {sideMenu} {headMenu}/>
</Theme>

<Content>
<!--    <div class="submenu">-->
<!--        {#each data.sections as section}-->
<!--            <a href="/settings/{section.slug}">{section.title}</a>-->
<!--        {/each}-->
<!--    </div>-->
    <Grid fullWidth>
        <slot></slot>
    </Grid>
</Content>