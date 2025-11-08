<script lang="ts">
  import Button from "../Button.svelte";
  import FrameSelector from "../FrameSelector.svelte";
  import SidebarItem from "./SidebarItem.svelte";

  export let onClickDownload: () => void;
  export let isDownloadEnabled: boolean;
  export let frameInfos: { id: string; name: string }[] = [];
  export let selectedFrameId: string | undefined;
  export let onSelectFrame: (frameId: string) => void;
  export let onClickOnSelectElement: () => void;
  export let onClickShowPreview: () => void;
</script>

<SidebarItem>
  <div slot="header" class="header">
    <div>Templates</div>
  </div>
  <div slot="content" class="content">
    <FrameSelector
      {frameInfos}
      {selectedFrameId}
      onSelect={onSelectFrame}
      {onClickOnSelectElement}
    />
    <Button variant="secondary" onClick={onClickShowPreview}
      >Show Preview</Button
    >
    <Button
      isDisabled={!isDownloadEnabled}
      variant="primary"
      onClick={onClickDownload}
    >
      Download HTML
    </Button>
  </div>
</SidebarItem>

<style>
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
</style>
