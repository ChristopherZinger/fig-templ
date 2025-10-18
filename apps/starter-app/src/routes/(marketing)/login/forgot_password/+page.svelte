<script lang="ts">
  import { Auth } from "@supabase/auth-ui-svelte"

  let { data } = $props()
</script>

<svelte:head>
  <title>Forgot Password</title>
</svelte:head>

<h1 class="text-2xl font-bold mb-6">Forgot Password</h1>
<div>Placeholder for forgot password form</div>
<div class="text-l text-slate-800 mt-4">
  Remember your password? <a class="underline" href="/login/sign_in">Sign in</a
  >.
</div>
