<script lang="ts">
  import MenuIcon from "$lib/icons/MenuIcon.svelte"
  import type { Snippet } from "svelte"
  import { WebsiteName } from "../../../../config"

  interface Props {
    children?: Snippet
    sideBarContent?: Snippet
  }

  let { children, sideBarContent }: Props = $props()
</script>

<div class="drawer lg:drawer-open">
  <input id="admin-drawer" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content">
    <div class="navbar bg-base-100 lg:hidden">
      <div class="flex-1">
        <a class="btn btn-ghost normal-case text-xl" href="/">{WebsiteName}</a>
      </div>
      <div class="flex-none">
        <div class="dropdown dropdown-end">
          <label for="admin-drawer" class="btn btn-ghost btn-circle">
            <MenuIcon />
          </label>
        </div>
      </div>
    </div>
    <div class="container px-6 lg:px-12 py-3 lg:py-6">
      {@render children?.()}
    </div>
  </div>

  <div class="drawer-side">
    <label for="admin-drawer" class="drawer-overlay"></label>

    <div
      class="menu menu-lg p-4 w-80 min-h-full bg-base-100 lg:border-r text-primary"
    >
      {#if sideBarContent}
        {@render sideBarContent?.()}
      {/if}
    </div>
  </div>
</div>
