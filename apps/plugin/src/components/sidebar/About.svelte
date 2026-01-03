<script lang="ts">
  const PLUGIN_VERSION = process.env.PLUGIN_VERSION;

  function onClickContactUs(): void {
    window.open("mailto:chrisandweb@gmail.com", "_blank");
  }
</script>

<div class="about-container">
  <h1>About Templetto</h1>

  <div>
    Templetto is a Figma plugin that streamlines HTML templating workflows. It
    converts your Figma frames into clean, responsive HTML templates that can
    be:
  </div>

  <ul>
    <li>Used to accelerate your development process</li>
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

<style>
  * {
    font-size: 11px;
  }

  .about-container {
    padding: 0.7rem;
    max-width: 400px;
  }

  span {
    cursor: pointer;
    text-decoration: underline;
    color: #0c8ce9;
  }
</style>
