<script lang="ts">
  import { WebsiteName } from "../../../config"
  import { userStore } from "$lib/stores/userStore"

  interface Props {
    children?: import("svelte").Snippet
  }

  let { children }: Props = $props()
</script>

<div class="navbar bg-base-100 container mx-auto">
  <div class="flex-1">
    <a class="btn btn-ghost normal-case text-xl" href="/">{WebsiteName}</a>
  </div>
  <div class="flex-none">
    <ul class="menu menu-horizontal px-1 hidden sm:flex font-bold text-lg">
      <li><a href="/docs">Docs</a></li>
      {#if $userStore}
        <li><a href="/account">Account</a></li>
      {:else}
        <li class="md:mx-4">
          <a href="/login/sign_in" class="border border-primary">Sign in</a>
        </li>
      {/if}
    </ul>
    <div class="dropdown dropdown-end sm:hidden">
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <label tabindex="0" class="btn btn-ghost btn-circle">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h7"
          /></svg
        >
      </label>
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <ul
        tabindex="0"
        class="menu menu-lg dropdown-content mt-3 z-1 p-2 shadow-sm bg-base-100 rounded-box w-52 font-bold"
      >
        {#if $userStore}
          <li><a href="/account">Account</a></li>
        {:else}
          <li><a href="/login/sign_in">Sign in</a></li>
        {/if}
        <li><a href="/docs">Docs</a></li>
      </ul>
    </div>
  </div>
</div>

<div class="">
  {@render children?.()}
</div>

<!-- Spacer grows so the footer can be at bottom on short pages -->
<div class="grow"></div>
<div class="">
  <div class="border-t max-w-[1000px] mx-auto"></div>
  <footer
    class="footer md:footer-horizontal p-10 gap-x-48 lg:gap-x-64 xl:gap-x-96 place-content-center text-base"
  >
    <nav>
      <span class="footer-title opacity-80">Explore</span>
      <a class="link link-hover mb-1" href="/">Overview</a>
      <a class="link link-hover my-1" href="/docs">Docs</a>
      <a class="link link-hover my-1" href="/contact_us">Contact Us</a>
    </nav>
    <aside>
      <div class="max-w-[260px]">
        <div class="font-bold text-3xl mb-1">Templetto</div>
        <div class="font-medium mb-3">Build High Quality PDFs</div>
        <div class="font-light">
          Use the tools designers love, collaborate with your team. Free plugin
          for Figma.
        </div>
      </div>
    </aside>
  </footer>
</div>
