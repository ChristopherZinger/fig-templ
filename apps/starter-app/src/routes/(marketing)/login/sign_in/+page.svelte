<script lang="ts">
  import { goto } from "$app/navigation"
  import { onAuthStateChanged } from "firebase/auth"
  import { onMount } from "svelte"
  import { SERVER_URL } from "$lib/backend-for-plugin/url"
  import { auth } from "$lib/utils/firebase/init-firebase"
  import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
  import { userStore } from "$lib/stores/userStore"

  onMount(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      userStore.set(user)
    } else {
      userStore.set(null);
    }
  });
});
  let hasPluginLoginFailed = false
  let isLoading = false
  async function login() {
    isLoading = true
    try {
      const provider = new GoogleAuthProvider()
      // TODO: set persistence to NONE
      // auth.setPersistence({ type: "NONE" })
      const result = await signInWithPopup(auth, provider)
    } catch (error) {
      console.error({ error })
      hasPluginLoginFailed = true
    } finally {
      isLoading = false
    }
  }
</script>

<svelte:head>
  <title>Sign in</title>
</svelte:head>

<!-- {#if $page.url.searchParams.get("verified") == "true"}
  <div role="alert" class="alert alert-success mb-5">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="stroke-current shrink-0 h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      ><path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      /></svg
    >
    <span>Email verified! Please sign in.</span>
  </div>
{/if} -->
<h1 class="text-2xl font-bold mb-6">Sign In</h1>
<button
  onclick={login}
  class="btn btn-primary w-full text-lg font-medium py-2 rounded-lg shadow transition duration-150 hover:bg-primary/90 focus:outline-none"
>
  Sign in with Google
</button>
<div class="text-l text-slate-800 mt-4">
  <a class="underline" href="/login/forgot_password">Forgot password?</a>
</div>
<div class="text-l text-slate-800 mt-3">
  Don't have an account? <a class="underline" href="/login/sign_up">Sign up</a>.
</div>
