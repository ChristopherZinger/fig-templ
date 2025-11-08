<script lang="ts">
  import { redirect } from "@sveltejs/kit"
  import { onMount } from "svelte"

  let { data, children } = $props()
  console.log(data)

  onMount(() => {
    if (!data.firebaseUser) {
      redirect(303, "/login")
    }
  })
</script>

{@render children?.()}
