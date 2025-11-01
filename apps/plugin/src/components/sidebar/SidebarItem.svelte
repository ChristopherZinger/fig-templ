<script lang="ts">
  export let onClick: (() => {}) | undefined = undefined;
</script>

<div class="sidebar-item">
  <div
    class="header"
    onclick={onClick}
    onkeyup={onClick}
    role="button"
    tabindex="0"
    class:button={!!onClick}
  >
    <slot name="header" />
  </div>
  {#if $$slots.content}
    <div class="content">
      <slot name="content" />
    </div>
  {/if}
</div>

<style>
  .sidebar-item {
    display: flex;
    flex-direction: column;
    border-bottom: 1px solid var(--light-gray);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.6875rem;
    font-weight: 450;
    padding: 0 0.7rem;
    max-height: 50px;
    height: 50px;
  }

  .content {
    display: flex;
    flex-direction: column;
    padding: 0.7rem;
  }

  .button {
    cursor: pointer;
  }
</style>
