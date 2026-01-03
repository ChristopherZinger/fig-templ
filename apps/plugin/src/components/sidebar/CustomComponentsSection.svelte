<script lang="ts">
  import { onDestroy } from "svelte";
  import { sendDropEventToMainThread } from "../../lib/utils/messages";
  import ImgIcon from "../icons/ImgIcon.svelte";

  let dragableImgIcon: HTMLDivElement | undefined;
  let dragableLoopIcon: HTMLDivElement | undefined;

  let unsubTemplateLoopDragEv: (() => void) | undefined;
  $: if (dragableLoopIcon) {
    unsubTemplateLoopDragEv?.();
    const fn = (e: DragEvent) => {
      sendDropEventToMainThread(e, "template-loop");
    };

    dragableLoopIcon.addEventListener("dragend", fn);
    unsubTemplateLoopDragEv = () => {
      dragableLoopIcon?.removeEventListener("dragend", fn);
    };
  }

  let unsubDynamicImageDragEv: (() => void) | undefined;
  $: if (dragableImgIcon) {
    unsubDynamicImageDragEv?.();
    const fn = (e: DragEvent) => {
      sendDropEventToMainThread(e, "dynamic-image");
    };

    dragableImgIcon.addEventListener("dragend", fn);
    unsubDynamicImageDragEv = () => {
      dragableImgIcon?.removeEventListener("dragend", fn);
    };
  }

  onDestroy(() => {
    unsubDynamicImageDragEv?.();
    unsubTemplateLoopDragEv?.();
  });
</script>

<div class="custom-components-container">
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

    <div
      class="custom-component-item"
      draggable={true}
      bind:this={dragableLoopIcon}
    >
      <ImgIcon width={20} height={20} />
      <div>Loop</div>
    </div>
  </div>
</div>

<style>
  .custom-components-container {
    padding: 0.7rem;
  }
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
