<script>
  import BaseLayout from "./BaseLayout.svelte";
</script>

<BaseLayout>
  <div slot="content"></div>
  <div slot="sidebar" class="sidebar">
    <div class="panel"></div>
  </div>
</BaseLayout>

<style>
  .sidebar {
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: space-between;
  }

  .panel {
    display: flex;
    flex-direction: column;
  }
</style>
