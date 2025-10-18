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

<h1>Account</h1>
<p>Welcome {data?.firebaseUser?.email}</p>
<p>Templates: {JSON.stringify(data?.userTemplates)}</p>
{@render children?.()}
