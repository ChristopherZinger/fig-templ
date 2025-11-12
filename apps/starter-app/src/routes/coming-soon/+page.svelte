<script lang="ts">
  import {
    WebsiteName,
    WebsiteBaseUrl,
    WebsiteDescription,
  } from "./../../config"
  import type { ActionData } from "./$types"

  export let form: ActionData

  const ldJson = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: WebsiteName,
    url: WebsiteBaseUrl,
  }
  const jsonldScript = `<script type="application/ld+json">${
    JSON.stringify(ldJson) + "<"
  }/script>`
</script>

<svelte:head>
  <title>{WebsiteName}</title>
  <meta name="description" content={WebsiteDescription} />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html jsonldScript}
</svelte:head>

<div class="hero min-h-[80vh]">
  <div class="hero-content text-center py-12">
    <div class="max-w-4xl">
      <div
        class="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-accent mb-3 md:mb-5 pb-1"
      >
        Signup to our waiting list!
      </div>

      <div
        class="text-5xl md:text-7xl font-bold px-2"
        style="line-height: 1.2;"
      >
        Turn
        <span
          class="underline decoration-secondary decoration-4 md:decoration-[6px]"
          >Figma designs</span
        >
        into
        <span
          class="underline decoration-secondary decoration-4 md:decoration-[6px]"
          >HTML templates & dynamic PDF documents</span
        >
      </div>
      <div class="mt-8 md:mt-10 text-lg md:text-xl max-w-xl mx-auto">
        Transform your Figma designs into HTML templates and generate
        professional PDFs with dynamic content—automated and scalable.
      </div>
      <div
        class="mt-8 md:mt-6 flex flex-row flex-wrap gap-4 place-content-center"
      >
        {#if !form?.success}
          <form
            method="POST"
            class="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
          >
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              class="input input-bordered input-lg flex-1 text-center sm:text-left"
            />
            <button
              type="submit"
              class="btn btn-primary btn-lg px-8 whitespace-nowrap"
            >
              Get Notified!
            </button>
          </form>
        {/if}
        {#if form?.success}
          <div class="mt-4 text-success text-lg font-semibold">
            Thanks! We'll notify you at {form.email}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
