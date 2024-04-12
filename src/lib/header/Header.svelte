<script lang="ts">
    import {
        Header,
        HeaderNav,
        HeaderNavItem,
        HeaderNavMenu, SideNav, SideNavItems,
        SideNavLink, SideNavMenu,
        SideNavMenuItem, SkipToContent, Theme
    } from "carbon-components-svelte";
    import { expoIn } from "svelte/easing";
    import type { HeaderNavItemProps } from "carbon-components-svelte/src/UIShell/HeaderNavItem.svelte";
    import type { SideNavLinkProps } from "carbon-components-svelte/src/UIShell/SideNavLink.svelte";
    import type {HeaderNavMenuProps} from "carbon-components-svelte/src/UIShell/HeaderNavMenu.svelte";
    import type {SideNavMenuProps} from "carbon-components-svelte/src/UIShell/SideNavMenu.svelte";
    import type {HeaderProps} from "carbon-components-svelte/src/UIShell/Header.svelte";
    export let isSideNavOpen:boolean;
    //let isOpen1, isOpen2 = false;
    export const transition = { duration: 600, delay: 50, easing: expoIn };
    type NavLink = HeaderNavItemProps | SideNavLinkProps;
    type Dir = HeaderNavMenuProps | SideNavMenuProps;
    interface NavTree {
        dir: Dir;
        items?: Array<NavLink>;
    }
    export type Nav = NavTree | NavLink;
    export let headMenu:Array<Nav> = [];
    export let sideMenu:Array<Nav> = [];
    export let headerVals: HeaderProps = {company: "Company", platformName:"", persistentHamburgerMenu: true, href:"/"};
</script>

<Header {...headerVals} bind:isSideNavOpen>
    <svelte:fragment slot="skip-to-content">
        <SkipToContent />
    </svelte:fragment>
    <!--		<HeaderUtilities>-->
    <!--			<HeaderGlobalAction aria-label="Logo" icon={dellLogo} />-->
    <!--		</HeaderUtilities>-->
    {#if headMenu.length > 0}
        <HeaderNav>
            {#each headMenu as h}
                {#if h.hasOwnProperty('dir')}
                    <HeaderNavMenu {...h.dir}>
                        {#each h.items as i}
                            <HeaderNavItem {...i}/>
                        {/each}
                    </HeaderNavMenu>
                {:else}
                    <HeaderNavItem {...h} />
                {/if}
            {/each}
<!--            		<HeaderNavItem href="/" text="Link 1" />-->
<!--            		<HeaderNavItem href="/about" text="About" />-->
<!--            		<HeaderNavItem href="/" text="Link 3" />-->
<!--            		<HeaderNavMenu text="Menu">-->
<!--            			<HeaderNavItem href="/" text="Link 1" />-->
<!--            			<HeaderNavItem href="/" text="Link 2" />-->
<!--            			<HeaderNavItem href="/" text="Link 3" />-->
<!--            		</HeaderNavMenu>-->
<!--            		<HeaderNavItem href="/" text="Link 4" />-->
        </HeaderNav>
    {/if}

    <!--	<HeaderUtilities>-->
    <!--		<HeaderGlobalAction aria-label="Settings" icon={SettingsAdjust} />-->
    <!--		<HeaderAction-->
    <!--				bind:isOpen={isOpen1}-->
    <!--				icon={UserAvatarFilledAlt}-->
    <!--				closeIcon={UserAvatarFilledAlt}-->
    <!--				{transition}-->
    <!--		>-->
    <!--			<HeaderPanelLinks>-->
    <!--				<HeaderPanelDivider>Switcher subject 1</HeaderPanelDivider>-->
    <!--				<HeaderPanelLink>Switcher item 1</HeaderPanelLink>-->
    <!--				<HeaderPanelLink>Switcher item 2</HeaderPanelLink>-->
    <!--				<HeaderPanelLink>Switcher item 3</HeaderPanelLink>-->
    <!--				<HeaderPanelLink>Switcher item 4</HeaderPanelLink>-->
    <!--				<HeaderPanelDivider>Switcher subject 2</HeaderPanelDivider>-->
    <!--				<HeaderPanelLink>Switcher item 1</HeaderPanelLink>-->
    <!--				<HeaderPanelLink>Switcher item 2</HeaderPanelLink>-->
    <!--				<HeaderPanelDivider>Switcher subject 3</HeaderPanelDivider>-->
    <!--				<HeaderPanelLink>Switcher item 1</HeaderPanelLink>-->
    <!--			</HeaderPanelLinks>-->
    <!--		</HeaderAction>-->
    <!--		<HeaderAction bind:isOpen={isOpen2} {transition}>-->
    <!--			<HeaderPanelLinks>-->
    <!--				<HeaderPanelDivider>Switcher subject 1</HeaderPanelDivider>-->
    <!--				<HeaderPanelLink>Switcher item 1</HeaderPanelLink>-->
    <!--				<HeaderPanelDivider>Switcher subject 2</HeaderPanelDivider>-->
    <!--				<HeaderPanelLink>Switcher item 1</HeaderPanelLink>-->
    <!--				<HeaderPanelLink>Switcher item 2</HeaderPanelLink>-->
    <!--&lt;!&ndash;				<HeaderPanelLink>Switcher item 3</HeaderPanelLink>&ndash;&gt;-->
    <!--&lt;!&ndash;				<HeaderPanelLink>Switcher item 4</HeaderPanelLink>&ndash;&gt;-->
    <!--&lt;!&ndash;				<HeaderPanelLink>Switcher item 5</HeaderPanelLink>&ndash;&gt;-->
    <!--			</HeaderPanelLinks>-->
    <!--		</HeaderAction>-->
    <!--	</HeaderUtilities>-->
</Header>

<SideNav bind:isOpen={isSideNavOpen}>
    <SideNavItems>
        {#each sideMenu as sideItem}
            {#if sideItem.hasOwnProperty("dir")}
                <SideNavMenu {...sideItem.dir}>
                    {#each sideItem.items as dirItem}
                        <SideNavMenuItem {...dirItem} />
                    {/each}
                </SideNavMenu>
            {:else}
                <SideNavLink {...sideItem} />
            {/if}
        {/each}
    </SideNavItems>
</SideNav>