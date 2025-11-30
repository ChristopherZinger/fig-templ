<script lang="ts">
  import { onMount } from "svelte"
  import { signOut } from "firebase/auth"
  import { auth } from "$lib/utils/firebase/init-firebase"

  onMount(async () => {
    await signOut(auth)
  })
</script>

<h1 class="text-2xl font-bold m-6 mx-auto my-auto">Signing out...</h1>
