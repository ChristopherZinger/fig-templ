<script lang="ts">
  import { page } from "$app/state"
  import { SERVER_URL } from "$lib/backend-for-plugin/url"
  import {
    GoogleAuthProvider,
    setPersistence,
    signInWithPopup,
    inMemoryPersistence,
  } from "firebase/auth"
  import { pluginAuth } from "$lib/utils/firebase/init-plugin-firebase"
  import ExclamationTriangleIcon from "./ExclamationTriangleIcon.svelte"
  import CheckInCircleIcon from "./CheckInCircleIcon.svelte"
  import XinCircleIcon from "./XinCircleIcon.svelte"
  import GoogleIcon from "./GoogleIcon.svelte"
  import KeyIcon from "./KeyIcon.svelte"

  const writeKey = page.url.searchParams.get("writeKey")

  /**
   * PLUGIN AUTH FLOW - PAGE OPENS IN THE BROWSER
   */

  let isPluginLoginComplete = false
  let hasPluginLoginFailed = false
  let isLoading = false
  async function login() {
    isLoading = true
    try {
      setPersistence(pluginAuth, inMemoryPersistence)

      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(pluginAuth, provider)
      const idToken = await result.user.getIdToken()

      const response = await fetch(`${SERVER_URL}/plugin/save-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          writeKey,
          token: idToken,
        }),
      })
      if (!response.ok) {
        console.error("failed_to_save_token", response)
        const error = await response.json()
        throw new Error("failed_to_save_token" + error)
      }
      isPluginLoginComplete = true
    } catch (error) {
      console.error({ error })
      hasPluginLoginFailed = true
    } finally {
      isLoading = false
    }
  }
</script>

<div
  class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5 p-6"
>
  <div class="w-full max-w-md">
    {#if !writeKey}
      <div class="card bg-error/10 border border-error/20 shadow-xl">
        <div class="card-body items-center text-center">
          <ExclamationTriangleIcon />
          <h2 class="card-title text-error">Missing Write Key</h2>
          <p class="text-base-content/70">
            This page requires a valid authentication key to proceed.
          </p>
        </div>
      </div>
    {:else if isLoading}
      <div class="card bg-base-100 shadow-2xl border border-base-300">
        <div class="card-body items-center text-center py-12">
          <div
            class="loading loading-spinner loading-lg text-primary mb-4"
          ></div>
          <h2 class="text-xl font-semibold text-base-content">
            Authenticating...
          </h2>
          <p class="text-sm text-base-content/60 mt-2">
            Please wait while we sign you in
          </p>
        </div>
      </div>
    {:else if isPluginLoginComplete}
      <div class="card bg-success/10 border border-success/20 shadow-xl">
        <div class="card-body items-center text-center">
          <div class="rounded-full bg-success/20 p-3 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-16 w-16 text-success"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 class="card-title text-success text-2xl mb-2">Login Complete!</h2>
          <p class="text-base-content/80 mb-6">
            You can now return to the Figma plugin
          </p>
          <div class="badge badge-success badge-lg gap-2">
            <CheckInCircleIcon />
            Authentication Successful
          </div>
        </div>
      </div>
    {:else if hasPluginLoginFailed}
      <div class="card bg-error/10 border border-error/20 shadow-xl">
        <div class="card-body items-center text-center">
          <XinCircleIcon />
          <h2 class="card-title text-error text-2xl mb-2">Login Failed</h2>
          <p class="text-base-content/70 mb-4">
            Something went wrong during authentication
          </p>
          <button onclick={login} class="btn btn-error btn-outline">
            Try Again
          </button>
        </div>
      </div>
    {:else}
      <div class="card bg-base-100 shadow-2xl border border-base-300">
        <div class="card-body items-center text-center p-8">
          <div class="mb-6">
            <div
              class="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg"
            >
              <KeyIcon />
            </div>
            <h1 class="text-3xl font-bold text-base-content mb-2">
              Templetto Plugin
            </h1>
            <p class="text-base-content/60">Sign in to continue</p>
          </div>

          <div class="divider my-6"></div>

          <button
            onclick={login}
            class="btn btn-primary btn-lg w-full gap-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
          >
            <GoogleIcon />
            Sign in with Google
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>
