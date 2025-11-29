<script lang="ts">
  import {
    WebsiteName,
    WebsiteBaseUrl,
    WebsiteDescription,
  } from "./../../config"
  import { userStore } from "$lib/stores/userStore"

  const ldJson = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: WebsiteName,
    url: WebsiteBaseUrl,
  }
  const jsonldScript = `<script type="application/ld+json">${
    JSON.stringify(ldJson) + "<"
  }/script>`

  const features = [
    {
      name: "Figma Plugin",
      description:
        "Extract and sync Figma designs into Templetto. Preview template outputs in real-time.",
      svgContent: "",
    },
    {
      name: "Reporting API",
      description:
        "Use our REST API to generate PDFs at scale. Integrate with your existing workflows.",
      svgContent: "",
    },
    {
      name: "Flexible Pricing",
      link: "/pricing",
      description:
        "Pay as you grow with usage-based pricing. From free tier to enterprise plans.",
      svgContent: "",
    },
    {
      name: "Subscriptions & Billing",
      link: "/account/billing",
      description:
        "Manage your subscription, view usage, update payment methods, and download invoices.",
      svgContent: "",
    },
    {
      name: "Account Dashboard",
      link: "/account",
      description:
        "Manage your templates, view API keys, monitor usage, and configure settings.",
      svgContent: "",
    },
    {
      name: "Contact Support",
      link: "/contact_us",
      description:
        "Get in touch with our team for help, questions, or enterprise inquiries.",
      svgContent: "",
    },
  ]
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
        class="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-accent mb-3 md:mb-5 pb-1"
      >
        Coming Soon
        {#if $userStore}
          <span class="text-sm text-gray-500"
            >Welcome, {$userStore.displayName}</span
          >
        {:else}
          <span class="text-sm text-gray-500">Sign in</span>
        {/if}
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
          >PDF documents</span
        >
      </div>
      <div class="mt-8 md:mt-10 text-lg md:text-xl max-w-xl mx-auto">
        Template your Figma files and generate professional PDFs with dynamic
        data through our API. Perfect for invoices, reports, certificates, and
        more.
      </div>
      <div
        class="mt-8 md:mt-6 flex flex-row flex-wrap gap-4 place-content-center"
      >
        <a href="/login/sign_up">
          <button class="btn btn-primary btn-lg px-8">Get Started</button>
        </a>
        <a href="/pricing">
          <button class="btn btn-outline btn-primary btn-lg px-8"
            >View Pricing</button
          >
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
      class="flex gap-6 mt-12 max-w-[900px] mx-auto place-content-center flex-wrap"
    >
      {#each features as feature}
        <div class="card bg-white w-[270px] min-h-[280px] flex-none shadow-xl">
          <div class="card-body items-center text-center p-[24px] pt-[32px]">
            <div>
              <svg
                width="50px"
                height="50px"
                class="mb-2 mt-1"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                {@html feature.svgContent}
              </svg>
            </div>
            <h2 class="card-title text-lg">
              {feature.name}
            </h2>
            <p class="text-sm flex-grow">
              {feature.description}
            </p>
            {#if feature.link}
              <a
                href={feature.link}
                class="pb-2 mt-auto"
                target={feature.newPage ? "_blank" : ""}
              >
                <button
                  class="btn btn-xs btn-outline rounded-full btn-primary min-w-[100px]"
                  >{feature.linkText ? feature.linkText : "Learn More"}</button
                >
              </a>
            {/if}
          </div>
        </div>
      {/each}
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
      <div class="mt-6 text-sm text-base-content/70">
        Free tier includes 100 PDF generations per month
      </div>
    </div>
  </div>
</div>
