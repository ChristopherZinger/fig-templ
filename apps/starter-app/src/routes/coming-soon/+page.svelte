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

<div class="h-full flex flex-col justify-items-center flex-1 items-center">
  <div
    class="max-w-4xl text-center py-12 flex-1 space-between h-full flex flex-col justify-between"
  >
    <div
      class="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 mb-3 md:mb-5 pb-1"
    >
      Signup to our waiting list!
    </div>

    <div class="text-5xl md:text-7xl font-bold px-2" style="line-height: 1.2;">
      Turn
      <span
        class="underline decoration-pink-500 decoration-4 md:decoration-[6px]"
        >Figma designs</span
      >
      into
      <span
        class="underline decoration-pink-500 decoration-4 md:decoration-[6px]"
      >
        HTML templates
      </span>
      &
      <span
        class="underline decoration-pink-500 decoration-4 md:decoration-[6px]"
      >
        dynamic PDF documents
      </span>
    </div>
    <div class=" text-lg md:text-xl max-w-xl mx-auto">
      Transform your Figma designs into HTML templates and generate professional
      PDFs with dynamic content—automated and scalable.
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
            class="px-6 py-4 text-lg border-2 border-gray-300 rounded-lg flex-1 text-center sm:text-left focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
          />
          <button
            type="submit"
            class="cursor-pointer px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg whitespace-nowrap hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-purple-600/50 transition-all"
          >
            Get Notified!
          </button>
        </form>
      {/if}
      {#if form?.success}
        <div class="text-green-600 text-lg font-semibold">
          Thanks! We'll notify you at {form.email}
        </div>
      {/if}
    </div>

    <div class="text-xl md:text-2xl font-bold color-pink pb-10">
      Download
      <a
        class="underline decoration-pink-500 decoration-4"
        target="_blank"
        href="https://www.figma.com/community/plugin/1570159248956206169/templetto"
      >
        Templetto (beta)
      </a>
      and start using it now!
    </div>
  </div>
</div>
