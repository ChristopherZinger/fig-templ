<script lang="ts">
  import { goto } from "$app/navigation"
  import { onMount } from "svelte"
  import { signOut } from "firebase/auth"
  import { auth } from "$lib/utils/firebase/init-firebase"
  let message = $state("Signing out....")

  // on mount, sign out
  onMount(() => {
    signOut(auth).then(() => {
      goto("/")
    })
  })
</script>

<h1 class="text-2xl font-bold m-6 mx-auto my-auto">{message}</h1>
