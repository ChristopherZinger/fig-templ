<script lang="ts">
  import Button from "./Button.svelte";

  export let viewMode: "preview" | "code" = "preview";
  export let onSelectMode: (mode: "preview" | "code") => void;
</script>

<div class="view-mode-selector">
  Select Mode:
  <Button
    onClick={() => onSelectMode("preview")}
    variant="naked"
    isActive={viewMode === "preview"}
  >
    Preview
  </Button>
  <Button
    variant="naked"
    isActive={viewMode === "code"}
    onClick={() => onSelectMode("code")}
  >
    Code
  </Button>
</div>

<style>
  .view-mode-selector {
    display: flex;
    gap: 10px;
    padding: 10px;
    color: white;
    font-size: 12px;
    height: 100%;
    align-items: center;
  }
</style>
