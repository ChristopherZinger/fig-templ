<script lang="ts">
  import { onDestroy } from "svelte";
  import { sendDropEventToMainThread } from "../../lib/utils/messages";
  import SidebarItem from "./SidebarItem.svelte";
  import ImgIcon from "../icons/ImgIcon.svelte";

  let dragableImgIcon: HTMLDivElement | undefined;
  let unsub: (() => void) | undefined;

  $: if (dragableImgIcon) {
    unsub?.();
    const fn = (e: DragEvent) => {
      sendDropEventToMainThread(e, "dynamic-image");
    };

    dragableImgIcon.addEventListener("dragend", fn);
    unsub = () => {
      dragableImgIcon?.removeEventListener("dragend", fn);
    };
  }

  onDestroy(() => {
    unsub?.();
  });
</script>

<SidebarItem isOpen={true}>
  <svelte:fragment slot="header">
    <div>Image</div>
  </svelte:fragment>

  <div slot="content">
    <div style="font-size: 10px; margin-bottom: 10px">
      Darag icons into the workspace.
    </div>
    <div class="custom-components-section">
      <div
        class="custom-component-item"
        draggable={true}
        bind:this={dragableImgIcon}
      >
        <ImgIcon width={20} height={20} />
        <div>Image</div>
      </div>
    </div>
  </div>
</SidebarItem>

<style>
  .custom-components-section {
    display: flex;
    gap: 10px;
  }

  .custom-component-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    cursor: pointer;
    font-size: 10px;
  }
</style>
