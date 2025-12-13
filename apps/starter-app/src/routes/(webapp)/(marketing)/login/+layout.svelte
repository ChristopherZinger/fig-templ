<script lang="ts">
  interface Props {
    children?: import("svelte").Snippet
  }

  let { children }: Props = $props()
  let isEurope = $state(false)
  try {
    isEurope = Intl.DateTimeFormat()
      .resolvedOptions()
      .timeZone.startsWith("Europe/")
  } catch (e) {
    /* continue */
  }
</script>

<div
  class="text-center content-center max-w-lg mx-auto min-h-[70vh] pb-12 flex items-center place-content-center"
>
  {@render children?.()}
</div>
