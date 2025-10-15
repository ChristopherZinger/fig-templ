<script lang="ts">
  import { auth } from "$lib/utils/firebase/init-firebase"
  import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"

  /**
   * THIS PAGE OPENS IN THE BROWSER
   * - TODO: should this be under other sub-path then /plugin since it opens in the browser?
   */

  async function login() {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)

    // TODO: set persistence to NONE

    // TODO: redirect or sign out
    // TODO: go back to plugin
  }
</script>

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
