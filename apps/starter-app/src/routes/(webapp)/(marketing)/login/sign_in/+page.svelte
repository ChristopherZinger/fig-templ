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

<div class="flex flex-col items-center justify-center">
  <h1 class="text-2xl font-bold mb-6">Welcome! Explore Templetto Studio!</h1>

  <div class="flex flex-col w-64 lg:w-80">
    <button
      onclick={login}
      class="btn btn-primary w-full text-lg font-medium py-2 rounded-lg shadow transition duration-150 hover:bg-primary/90 focus:outline-none"
      disabled={isLoading}
    >
      Sign in with Google
    </button>
  </div>
</div>
