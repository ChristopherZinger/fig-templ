<script lang="ts">
  import SidebarItem from "./SidebarItem.svelte";

  export let onClick: () => {};
  export let isSelected: boolean = false;
</script>

<SidebarItem {onClick}>
  <div slot="header" class="header">
    <div class:selected={isSelected}>Templates</div>
  </div>
</SidebarItem>

<style>
  .selected {
    color: white;
    text-decoration: underline;
  }
</style>
