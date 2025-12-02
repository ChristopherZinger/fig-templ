<script lang="ts">
  import { redirect } from "@sveltejs/kit"
  import { onMount } from "svelte"
  import { WebsiteName } from "../../config"
  import type { DecodedIdToken } from "firebase-admin/auth"
  import HomeIcon from "$lib/icons/HomeIcon.svelte"
  import CopyIcon from "$lib/icons/CopyIcon.svelte"
  import SidebarLayout from "$lib/components/layouts/sidebar/SidebarLayout.svelte"

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

<SidebarLayout>
  {#snippet sideBarContent()}
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
  {/snippet}

  {@render children?.()}
</SidebarLayout>
