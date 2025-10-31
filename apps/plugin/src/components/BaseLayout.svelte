<div class="base-layout">
  <div class="content">
    <slot name="content" />
  </div>
  <div class="right">
    <slot name="sidebar" />
  </div>
</div>

<style>
  .base-layout {
    display: flex;
    flex-direction: row;
    height: 100%;
  }

  .content {
    flex: 1;
    border-right: 1px solid var(--light-gray);
  }

  .right {
    width: 250px;
  }
</style>
