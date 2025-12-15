<script lang="ts">
  import { APP_NAME } from "../../../config"
  import SidebarLayout from "$lib/components/layouts/sidebar/SidebarLayout.svelte"
  import type { Snippet } from "svelte"

  interface Props {
    children?: Snippet
  }

  let { children }: Props = $props()

  let activeSection = $state("overview")
  let isSidebarOpen = $state(false)

  function scrollToSection(id: string) {
    activeSection = id
    isSidebarOpen = false
    const element = document.getElementById(id)
    if (element) {
      const offset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }
</script>

<SidebarLayout>
  {#snippet sideBarContent()}
    <ul>
      <li>
        <div
          class="normal-case menu-title text-xl font-bold text-primary flex flex-row"
        >
          <a href="/" class="grow">{APP_NAME}</a>
          <label for="admin-drawer" class="lg:hidden ml-3"> &#x2715; </label>
        </div>
      </li>
      <li>
        <button
          class="nav-item"
          class:active={activeSection === "overview"}
          onclick={() => scrollToSection("overview")}
        >
          Overview
        </button>
      </li>
    </ul>

    <ul>
      <li>
        <div
          class="normal-case menu-title text-l font-bold text-primary flex flex-row"
        >
          API Reference
        </div>
      </li>
      <li>
        <button
          class="nav-item"
          class:active={activeSection === "api"}
          onclick={() => scrollToSection("api")}
        >
          Introduction
        </button>
      </li>
      <li>
        <button
          class="nav-item nav-sub"
          class:active={activeSection === "api-authentication"}
          onclick={() => scrollToSection("api-authentication")}
        >
          Authentication
        </button>
      </li>
      <li>
        <button
          class="nav-item nav-sub"
          class:active={activeSection === "api-create-pdf"}
          onclick={() => scrollToSection("api-create-pdf")}
        >
          Create PDF
        </button>
      </li>
    </ul>
    <ul>
      <li>
        <div
          class="normal-case menu-title text-l font-bold text-primary flex flex-row"
        >
          Templating
        </div>
      </li>
      <li>
        <button
          class="nav-item"
          class:active={activeSection === "templating"}
          onclick={() => scrollToSection("templating")}
        >
          Introduction
        </button>
      </li>
      <li>
        <button
          class="nav-item nav-sub"
          class:active={activeSection === "templating-syntax"}
          onclick={() => scrollToSection("templating-syntax")}
        >
          Syntax
        </button>
      </li>
      <li>
        <button
          class="nav-item nav-sub"
          class:active={activeSection === "templating-examples"}
          onclick={() => scrollToSection("templating-examples")}
        >
          Examples
        </button>
      </li>
    </ul>
    <ul>
      <li>
        <div
          class="normal-case menu-title text-l font-bold text-primary flex flex-row"
        >
          Figma Plugin
        </div>
      </li>
      <li>
        <button
          class="nav-item"
          class:active={activeSection === "plugin"}
          onclick={() => scrollToSection("plugin")}
        >
          Introduction
        </button>
      </li>

      <li>
        <button
          class="nav-item nav-sub"
          class:active={activeSection === "plugin-setup"}
          onclick={() => scrollToSection("plugin-setup")}
        >
          Setup
        </button>
      </li>

      <li>
        <button
          class="nav-item nav-sub"
          class:active={activeSection === "plugin-workflow"}
          onclick={() => scrollToSection("plugin-workflow")}
        >
          Workflow
        </button>
      </li>
      <li>
        <button
          class="nav-item nav-sub"
          class:active={activeSection === "plugin-config"}
          onclick={() => scrollToSection("plugin-config")}
        >
          Configuration
        </button>
      </li>
    </ul>
  {/snippet}
  {@render children?.()}
</SidebarLayout>
