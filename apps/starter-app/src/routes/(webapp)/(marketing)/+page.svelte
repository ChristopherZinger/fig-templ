<script lang="ts">
  import {
    WebsiteName,
    WebsiteBaseUrl,
    WebsiteDescription,
    PLUGIN_DOWNLOAD_URL,
  } from "../../../config"

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

<div class="hero min-h-[70vh]">
  <div class="hero-content text-center py-12">
    <div class="max-w-2xl">
      <div
        class="text-5xl md:text-7xl font-bold px-2"
        style="line-height: 1.2;"
      >
        Turn
        <span
          class="underline decoration-secondary decoration-4 md:decoration-[6px]"
          >Figma designs</span
        >
        into dynamic
        <span
          class="underline decoration-secondary decoration-4 md:decoration-[6px]"
          >PDF documents</span
        >
      </div>
      <div class="mt-8 md:mt-10 text-lg md:text-xl max-w-xl mx-auto">
        Convert your Figma designs into HTML templates and generate professional
        PDFs with dynamic data through our API. Perfect for invoices, reports,
        certificates, and more.
      </div>
      <div
        class="mt-8 md:mt-6 flex flex-row flex-wrap gap-4 place-content-center"
      >
        <a href="/login/sign_in">
          <button class="btn btn-primary btn-lg px-8">Get Started</button>
        </a>
      </div>
    </div>
  </div>
</div>

<div class="min-h-[60vh] bg-base-200">
  <div class="pt-20 pb-8 px-7">
    <div class="max-w-lg mx-auto text-center">
      <div
        class="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-accent pb-2"
      >
        How It Works
      </div>
      <div class="mt-4 text-lg">
        Design templates in Figma, then generate PDFs via API
      </div>
    </div>

    <div
      class="flex gap-6 mt-12 max-w-[400px] mx-auto place-content-center flex-wrap"
    >
      <img
        src="/images/how-it-works-diagram.png"
        alt="How It Works"
        class="w-full h-full object-cover"
      />

      <a href={PLUGIN_DOWNLOAD_URL} target="_blank">
        <button class="btn btn-primary btn-lg px-8">Download Plugin</button>
      </a>
    </div>
  </div>
</div>

<div class="hero min-h-[50vh] mt-12">
  <div class="hero-content text-center pb-16 pt-4 px-4">
    <div class="max-w-2xl">
      <div
        class="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-accent mt-4 pb-2"
      >
        Ready to Get Started?
      </div>
      <div class="mt-6 text-lg md:text-xl px-4">
        Sign up for a free account and start generating PDFs from your Figma
        designs. No credit card required for the free trial.
      </div>
      <div class="mt-8">
        <a href="/login/sign_up">
          <button class="btn btn-primary btn-lg btn-wide">
            Create Free Account
          </button>
        </a>
      </div>
    </div>
  </div>
</div>
