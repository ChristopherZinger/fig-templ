<script lang="ts">
  import { redirect } from "@sveltejs/kit"
  import { onMount } from "svelte"
  import { WebsiteName } from "../../config"
  import type { DecodedIdToken } from "firebase-admin/auth"
  import HomeIcon from "$lib/icons/HomeIcon.svelte"
  import MenuIcon from "$lib/icons/MenuIcon.svelte"
  import CopyIcon from "$lib/icons/CopyIcon.svelte"

  interface Props {
    children?: import("svelte").Snippet
    data: {
      firebaseUser: DecodedIdToken
      templates: {
        id: string
        name?: string
        createdAt?: Date
        downloadUrl: string
      }[]
    }
  }

  let { children, data }: Props = $props()

  onMount(() => {
    if (!data.firebaseUser) {
      redirect(303, "/login")
    }
  })
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
      <ul>
        <li>
          <div
            class="normal-case menu-title text-xl font-bold text-primary flex flex-row"
          >
            <a href="/" class="grow">{WebsiteName}</a>
            <label for="admin-drawer" class="lg:hidden ml-3"> &#x2715; </label>
          </div>
        </li>
        <li>
          <a href="/account"><HomeIcon /> Home</a>
        </li>
        <li>
          <a href="/account/api-tokens"><CopyIcon /> API Tokens</a>
        </li>
        <li>
          <a href="/account/profile">Profile</a>
        </li>
      </ul>

      <ul class="mt-auto">
        <li class="py-1.5 px-4">
          {data.firebaseUser?.email}
        </li>
        <li class="mt-auto">
          <a href="/account/sign_out" class="mt-auto text-base">Sign Out</a>
        </li>
      </ul>
    </div>
  </div>
</div>
