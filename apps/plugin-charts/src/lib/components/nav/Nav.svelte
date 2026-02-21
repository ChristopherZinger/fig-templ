<script lang="ts">
  import SettingsPanel from "../settings-panel/SettingsPanel.svelte";
  import NavItem from "./NavItem.svelte";

  export let onHover: (navItem: "chart" | "style" | "data") => void;
  export let onClose: () => void;
  export let selectedNavItem: "chart" | "style" | "data" | null;
</script>

<div class="nav-container">
  <nav>
    <NavItem onHover={() => onHover("chart")}>cha</NavItem>
    <NavItem onHover={() => onHover("style")}>st</NavItem>
    <NavItem onHover={() => onHover("data")}>da</NavItem>
  </nav>

  <SettingsPanel {selectedNavItem} {onClose} />
</div>

<style>
  .nav-container {
    height: 100%;
    position: relative;
  }

  nav {
    display: flex;
    flex-direction: column;
    width: 40px;
    background-color: var(--col-bg);
    border-radius: 10px;
    height: 100%;
  }
</style>
