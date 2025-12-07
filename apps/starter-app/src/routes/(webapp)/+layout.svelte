<script lang="ts">
  import Authentication from "./Authentication.svelte"

  interface Props {
    children?: import("svelte").Snippet
  }
  let { children }: Props = $props()
</script>

<Authentication>
  {@render children?.()}
</Authentication>
