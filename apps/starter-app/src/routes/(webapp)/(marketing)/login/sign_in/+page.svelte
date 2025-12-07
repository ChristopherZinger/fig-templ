<script lang="ts">
  import { auth } from "$lib/utils/firebase/init-firebase"
  import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"

  let isLoading = false
  async function login() {
    isLoading = true
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
    } catch (error) {
      console.error({ error })
    } finally {
      isLoading = false
    }
  }
</script>

<svelte:head>
  <title>Sign in</title>
</svelte:head>

<h1 class="text-2xl font-bold mb-6">Sign In</h1>
<button
  onclick={login}
  class="btn btn-primary w-full text-lg font-medium py-2 rounded-lg shadow transition duration-150 hover:bg-primary/90 focus:outline-none"
  disabled={isLoading}
>
  Sign in with Google
</button>
<div class="text-l text-slate-800 mt-4">
  <a class="underline" href="/login/forgot_password">Forgot password?</a>
</div>
<div class="text-l text-slate-800 mt-3">
  Don't have an account? <a class="underline" href="/login/sign_up">Sign up</a>.
</div>
