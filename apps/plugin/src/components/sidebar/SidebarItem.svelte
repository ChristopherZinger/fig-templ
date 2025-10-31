<div class="sidebar-item">
  <div class="header">
    <slot name="header" />
  </div>
  <div class="content">
    <slot name="content" />
  </div>
</div>

<style>
  .sidebar-item {
    display: flex;
    flex-direction: column;
    padding: 0.8rem;
    border-bottom: 1px solid var(--light-gray);
  }

  .header {
    align-items: center;
    font-size: 0.6875rem;
    font-weight: 450;
  }

  .content {
    display: flex;
    flex-direction: column;
  }
</style>
