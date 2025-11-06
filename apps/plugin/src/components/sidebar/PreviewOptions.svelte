<script lang="ts">
  import SidebarItem from "./SidebarItem.svelte";
</script>

<SidebarItem>
  <div slot="header" class="header">
    <div>Templates</div>
  </div>
  <div slot="content" class="content">
    <div>select frame</div>
    <div>show preview</div>
    <div>show code</div>
    <button class="download-button" onclick={() => {}}>Download HTML</button>
  </div>
</SidebarItem>

<style>
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .download-button {
    background-color: #0c8ce9;
    padding: 0.5rem 1rem;
    width: 100%;
    text-align: center;
    outline: none;
    border: none;
    border-radius: 0.5rem;
  }
</style>
