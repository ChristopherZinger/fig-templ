<script lang="ts">
  import SidebarItem from "./SidebarItem.svelte";

  export let onClick: () => void;
  export let isOpen: boolean;
</script>

<SidebarItem {onClick} {isOpen}>
  <div slot="header" class="header">
    <div>Templates</div>
  </div>
</SidebarItem>
