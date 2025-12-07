<script lang="ts">
  import Prism from "prismjs"
  import "prismjs/themes/prism-tomorrow.css"
  import "prismjs/components/prism-markup.js"
  import prettier from "prettier/standalone"
  import prettierHtml from "prettier/plugins/html"

  let { htmlString } = $props()

  let prettyHtml: string | undefined | null = $state("")

  async function onHtmlStringChange(
    html: string | undefined | null,
  ): Promise<void> {
    prettyHtml = undefined
    if (!html) {
      prettyHtml = null
      return
    }

    try {
      const formattedHtml = await prettier.format(html, {
        parser: "html",
        plugins: [prettierHtml],
        printWidth: 80,
        tabWidth: 2,
      })

      const highlightedHtml = Prism.highlight(
        formattedHtml,
        Prism.languages.markup,
        "markup",
      )
      prettyHtml = highlightedHtml
    } catch (error) {
      console.error("Error formatting HTML:", error)
      prettyHtml = null
    }
  }
  $effect(() => {
    onHtmlStringChange(htmlString)
  })
</script>

<div class="code-container">
  <pre class="language-markup">
        <code class="language-markup"> {@html prettyHtml}</code>
    </pre>
</div>

<style>
  .code-container {
    background-color: #2d2d2d;
  }

  .code-container pre {
    margin: 0px;
    font-size: 12px;
    line-height: 1.5;
    padding: 0px;
  }

  .code-container code {
    display: block;
    white-space: pre;
    font-family: inherit;
  }
</style>
