<script lang="ts">
  import { onDestroy } from "svelte";
  import { sendDropEventToMainThread } from "../../lib/utils/messages";
  import ImgIcon from "../icons/ImgIcon.svelte";

  let dragableImgIcon: HTMLDivElement | undefined;
  let dragableLoopIcon: HTMLDivElement | undefined;

  let unsub_2: (() => void) | undefined;
  $: if (dragableLoopIcon) {
    unsub_2?.();
    const fn = (e: DragEvent) => {
      sendDropEventToMainThread(e, "template-loop");
    };

    dragableLoopIcon.addEventListener("dragend", fn);
    unsub_2 = () => {
      dragableLoopIcon?.removeEventListener("dragend", fn);
    };
  }
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
