<script lang="ts">
  import { onDestroy, onMount } from "svelte"
  import z from "zod"
  import BrowserIcon from "./BrowserIcon.svelte"
  import CheckIcon from "./CheckIcon.svelte"
  import XIcon from "./XIcon.svelte"
  import { API_URL, WEBAPP_URL } from "../../../config"

  /**
   * PLUGIN AUTH FLOW - PAGE OPENS IN THE FIGMA IFRAME
   */

  let writeKey: string | null = null
  let readKey: string | null = null
  let interval: NodeJS.Timeout | null = null
  let authState: "initializing" | "waiting" | "success" | "error" =
    "initializing"
  let errorMessage = ""

  async function getPkceKeys() {
    try {
      console.log("getting_pkce_keys")
      const response = await fetch(`${API_URL}/plugin/get-pkce-keys`, {
        method: "GET",
      })
      const resp = await response.json()
      writeKey = resp.writeKey
      readKey = resp.readKey

      if (interval) {
        clearInterval(interval)
      }
      interval = setInterval(
        () => readKey && pullSessionToken(readKey),
        1000 * 1,
      )

      window.open(`${WEBAPP_URL}/plugin/login?writeKey=${writeKey}`, "_blank")
      authState = "waiting"
    } catch (error) {
      console.log({ error })
      authState = "error"
      errorMessage = "Failed to initialize authentication"
    }
  }

  async function pullSessionToken(readKey: string) {
    console.log("pulling_session_token")
    let sessionKey: string | null = null
    try {
      const response = await fetch(`${API_URL}/plugin/read-session-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readKey, writeKey }),
      })
      if (!response.ok) {
        console.error("failed_to_pull_session", response)
        return
      }
      const respBody = await response.json()
      const parseResult = z.object({ sessionKey: z.string() }).parse(respBody)
      sessionKey = parseResult.sessionKey

      parent.postMessage(
        {
          pluginMessage: {
            type: "post_session_cookie_to_ui_thread",
            data: { sessionToken: sessionKey },
          },
          // pluginId must correspond to the ids in the manifest.json file.
          pluginId: "1570159248956206169",
        },
        "https://www.figma.com",
      )
    } catch (error) {
      console.error({ error })
      return
    }

    if (!sessionKey) {
      console.error("expected_session_key")
      return
    }
    if (interval) {
      clearInterval(interval)
    }

    authState = "success"
  }

  onMount(() => {
    void getPkceKeys()
  })

  onDestroy(() => {
    if (interval) {
      clearInterval(interval)
    }
  })
</script>

<div class="h-screen w-full flex items-center justify-center bg-base-100 p-4">
  <div class="text-center max-w-sm">
    {#if authState === "initializing"}
      <div class="flex flex-col items-center gap-4">
        <div class="loading loading-spinner loading-lg text-primary"></div>
        <div>
          <h2 class="text-lg font-semibold text-base-content mb-1">
            Initializing Authentication
          </h2>
          <p class="text-sm text-base-content/60">Preparing secure login...</p>
        </div>
      </div>
    {:else if authState === "waiting"}
      <div class="flex flex-col items-center gap-6">
        <div class="relative">
          <div class="absolute inset-0 animate-ping">
            <div class="w-20 h-20 bg-primary/20 rounded-2xl"></div>
          </div>
          <div
            class="relative w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg"
          >
            <BrowserIcon />
          </div>
        </div>

        <div>
          <h2 class="text-xl font-bold text-base-content mb-2">
            Continue in Browser
          </h2>
          <p class="text-sm text-base-content/70 mb-4">
            A browser window has been opened.<br />
            Please complete the authentication there.
          </p>

          <div class="flex items-center justify-center gap-1.5 mt-6">
            <div
              class="w-2 h-2 bg-primary rounded-full animate-bounce"
              style="animation-delay: 0ms;"
            ></div>
            <div
              class="w-2 h-2 bg-primary rounded-full animate-bounce"
              style="animation-delay: 150ms;"
            ></div>
            <div
              class="w-2 h-2 bg-primary rounded-full animate-bounce"
              style="animation-delay: 300ms;"
            ></div>
          </div>
          <p class="text-xs text-base-content/50 mt-2">
            Waiting for authentication...
          </p>
        </div>
      </div>
    {:else if authState === "success"}
      <div class="flex flex-col items-center gap-4">
        <div
          class="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center"
        >
          <CheckIcon />
        </div>
        <div>
          <h2 class="text-xl font-bold text-success mb-2">
            Authentication Complete!
          </h2>
          <p class="text-sm text-base-content/70">You're now logged in</p>
        </div>
      </div>
    {:else if authState === "error"}
      <div class="flex flex-col items-center gap-4">
        <div
          class="w-20 h-20 bg-error/20 rounded-full flex items-center justify-center"
        >
          <XIcon />
        </div>
        <div>
          <h2 class="text-xl font-bold text-error mb-2">
            Authentication Failed
          </h2>
          <p class="text-sm text-base-content/70 mb-4">
            {errorMessage || "Something went wrong"}
          </p>
          <button
            onclick={() => {
              authState = "initializing"
              void getPkceKeys()
            }}
            class="btn btn-error btn-sm btn-outline"
          >
            Try Again
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>
