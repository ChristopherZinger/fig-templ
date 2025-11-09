<script lang="ts">
  import SidebarItem from "./SidebarItem.svelte";

  const PLUGIN_VERSION = process.env.PLUGIN_VERSION;
  let isOpen = false;

  function onClickContactUs(): void {
    window.open("mailto:chrisandweb@gmail.com", "_blank");
  }
</script>

<SidebarItem onClick={() => (isOpen = !isOpen)} {isOpen}>
  <svelte:fragment slot="header">
    <div>About Templetto</div>
  </svelte:fragment>

  <div slot="content">
    <div>
      Templetto is a Figma plugin that streamlines HTML templating workflows. It
      converts your Figma frames into clean, responsive HTML templates that can
      be:
    </div>

    <ul>
      <li>Used to accelerate your development process</li>
      <li>Tested for responsiveness across different screen sizes</li>
      <li>Integrated with templating engines like Handlebars or Jinja</li>
    </ul>

    <div><strong>Tips for Best Results</strong></div>
    <div>
      Templetto will do its best to create responsive HTML code. For optimal
      results, use auto-layout for your frames and components. Elements without
      auto-layout (such as groups) will be exported as base64-encoded images—you
      can leverage this behavior when you intentionally want to export frames as
      images.
    </div>

    <br />
    <div>
      Contact us at
      <span
        role="button"
        tabindex="0"
        onclick={onClickContactUs}
        onkeydown={onClickContactUs}
      >
        chrisandweb@gmail.com
      </span>
    </div>

    <br />
    <div>Version: {PLUGIN_VERSION}</div>
  </div>
</SidebarItem>

<style>
  * {
    font-size: 11px;
  }

  span {
    cursor: pointer;
    text-decoration: underline;
    color: #0c8ce9;
  }
</style>
