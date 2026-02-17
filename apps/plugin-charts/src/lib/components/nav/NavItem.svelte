<script lang="ts">
  export let onHover: () => void;
</script>

<div class="nav-item" on:mouseenter={onHover} role="button" tabindex="0">
  <slot />
</div>

<style>
  .nav-item {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 40px;
    width: 40px;
    border: 1px solid var(--light-gray);
    color: var(--col-text);
    font-size: 12px;
    cursor: pointer;
  }
</style>
