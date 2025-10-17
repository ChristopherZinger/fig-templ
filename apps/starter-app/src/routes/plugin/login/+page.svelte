<script lang="ts">
  import { page } from "$app/state"
  import { SERVER_URL } from "$lib/backend-for-plugin/url"
  import { auth } from "$lib/utils/firebase/init-firebase"
  import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"

  const writeKey = page.url.searchParams.get("writeKey")

  /**
   * THIS PAGE OPENS IN THE BROWSER
   * - TODO: should this be under other sub-path then /plugin since it opens in the browser?
   */

  let isPluginLoginComplete = false
  let hasPluginLoginFailed = false
  let isLoading = false
  async function login() {
    isLoading = true
    try {
      const provider = new GoogleAuthProvider()
      // TODO: set persistence to NONE
      // auth.setPersistence({ type: "NONE" })
      const result = await signInWithPopup(auth, provider)
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
      await auth.signOut()
      isPluginLoginComplete = true
    } catch (error) {
      console.error({ error })
      hasPluginLoginFailed = true
    } finally {
      isLoading = false
    }
  }
</script>

{#if !writeKey}
  Missing write key
{:else if isLoading}
  Loading...
{:else if isPluginLoginComplete}
  <div>Login complete</div>
  <div>Go back to plugin</div>
{:else if hasPluginLoginFailed}
  Plugin login failed
{:else}
  <div
    class="min-h-screen flex flex-col items-center justify-center bg-base-100 py-8"
  >
    <h1 class="text-4xl font-bold mb-10 text-primary">Templetto Plugin</h1>
    <div
      class="w-full max-w-xs rounded-xl shadow-lg bg-base-200 p-8 flex flex-col items-center"
    >
      <h2 class="text-2xl font-semibold mb-6 text-base-content">Login</h2>
      <button
        onclick={login}
        class="btn btn-primary w-full text-lg font-medium py-2 rounded-lg shadow transition duration-150 hover:bg-primary/90 focus:outline-none"
      >
        Sign in with Google
      </button>
    </div>
  </div>
{/if}
