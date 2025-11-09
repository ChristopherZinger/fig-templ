<script lang="ts">
  import SidebarItem from "./SidebarItem.svelte";

  export let onClick: () => {};
</script>

<SidebarItem {onClick}>
  <div slot="header" class="header">
    <div>Templates</div>
  </div>
</SidebarItem>
