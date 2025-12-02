<script lang="ts">
  import { WebsiteName } from "./../../config"
</script>

<svelte:head>
  <title>Documentation - {WebsiteName}</title>
  <meta
    name="description"
    content="Complete documentation for Templetto API, templating language, and Figma plugin"
  />
</svelte:head>

<main class="docs-content">
  <section id="overview" class="doc-section">
    <h1 class="doc-title">Documentation</h1>
    <p class="doc-intro">
      Welcome to the {WebsiteName} documentation. This guide will help you get started
      with creating PDF templates from Figma designs and generating PDFs through
      our REST API.
    </p>

    <div class="feature-grid">
      <div class="feature-card">
        <div class="feature-icon">🎨</div>
        <h3>Design in Figma</h3>
        <p>
          Create beautiful templates using the design tools you already know
        </p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">⚡</div>
        <h3>Generate PDFs</h3>
        <p>Convert your designs to PDFs instantly via our API</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🔄</div>
        <h3>Dynamic Data</h3>
        <p>Inject dynamic content into your templates programmatically</p>
      </div>
    </div>
  </section>

  <section id="api" class="doc-section">
    <h2 class="section-title">API Reference</h2>
    <p>
      The Templetto REST API allows you to generate PDFs from your saved
      templates programmatically. All API requests must be authenticated using
      an API token.
    </p>

    <div class="info-box">
      <strong>Base URL:</strong>
      <code class="inline-code">https://api.templetto.com</code>
    </div>
  </section>

  <section id="api-authentication" class="doc-section">
    <h3 class="subsection-title">Authentication</h3>
    <p>
      All API requests require authentication using an API token. Include your
      API token in the request headers:
    </p>

    <div class="code-block">
      <pre><code>Authorization: Bearer YOUR_API_TOKEN</code></pre>
    </div>

    <p class="mt-4">
      You can generate API tokens from your
      <a href="/account/billing" class="doc-link">account dashboard</a>.
    </p>

    <div class="warning-box">
      <strong>⚠️ Security Note:</strong> Never expose your API tokens in client-side
      code or public repositories. API tokens grant full access to your account.
    </div>
  </section>

  <section id="api-create-pdf" class="doc-section">
    <h3 class="subsection-title">Create PDF</h3>
    <p>Generate a PDF from a template with dynamic data.</p>

    <div class="endpoint-card">
      <div class="endpoint-header">
        <span class="http-method">POST</span>
        <code class="endpoint-path">/api/create-pdf</code>
      </div>

      <h4 class="param-title">Query Parameters</h4>
      <table class="param-table">
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>template-id</code></td>
            <td>string</td>
            <td>Yes</td>
            <td>The ID of your saved template</td>
          </tr>
        </tbody>
      </table>

      <h4 class="param-title">Request Body</h4>
      <p>
        JSON object containing the data to inject into your template. The
        structure depends on your template design.
      </p>

      <div class="code-block">
        <pre><code
            >{`{
  "customerName": "John Doe",
  "invoiceNumber": "INV-001",
  "amount": "$1,234.56",
  "date": "2024-01-15"
}`}</code
          ></pre>
      </div>

      <h4 class="param-title">Response</h4>
      <p>Returns a JSON object with a download URL for the generated PDF.</p>

      <div class="code-block">
        <pre><code
            >{`{
  "downloadUrl": "https://storage.googleapis.com/..."
}`}</code
          ></pre>
      </div>

      <h4 class="param-title">Example Request</h4>
      <div class="code-block">
        <pre><code
            >{`curl -X POST "https://api.templetto.com/api/create-pdf?template-id=abc123" \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "customerName": "John Doe",
    "invoiceNumber": "INV-001",
    "amount": "$1,234.56"
  }'`}</code
          ></pre>
      </div>

      <h4 class="param-title">Error Responses</h4>
      <table class="param-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Error</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>400</td>
            <td>invalid_request</td>
            <td>Missing or invalid parameters</td>
          </tr>
          <tr>
            <td>401</td>
            <td>unauthorized</td>
            <td>Invalid or missing API token</td>
          </tr>
          <tr>
            <td>404</td>
            <td>template_not_found</td>
            <td
              >Template does not exist or doesn't belong to your organization</td
            >
          </tr>
          <tr>
            <td>500</td>
            <td>Internal server error</td>
            <td>Server error during PDF generation</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <section id="templating" class="doc-section">
    <h2 class="section-title">Templating Language</h2>
    <p>
      Templetto converts your Figma designs into HTML templates that can be
      filled with dynamic data. The system uses a simple variable substitution
      approach.
    </p>

    <div class="info-box">
      <strong>How it works:</strong> Text layers in your Figma design can contain
      variable placeholders that will be replaced with actual data when generating
      PDFs.
    </div>
  </section>

  <section id="templating-syntax" class="doc-section">
    <h3 class="subsection-title">Variable Syntax</h3>
    <p>
      Variables in your Figma text layers should match the keys in the JSON data
      you send to the API. The HTML template preserves the text content from
      Figma, including any variable placeholders you define.
    </p>

    <h4 class="example-title">Design Approach</h4>
    <p>
      When designing your template in Figma, use placeholder text that clearly
      indicates where dynamic data will be inserted. Common conventions include:
    </p>

    <ul class="doc-list">
      <li>
        <code class="inline-code">{"{{variableName}}"}</code> - Double curly braces
        style
      </li>
      <li>
        <code class="inline-code">[variableName]</code> - Square brackets style
      </li>
      <li>
        <code class="inline-code">$variableName</code> - Dollar sign prefix
      </li>
      <li>
        <code class="inline-code">VARIABLE_NAME</code> - All caps placeholder
      </li>
    </ul>

    <div class="info-box mt-4">
      <strong>Note:</strong> The templating system exports your Figma design as HTML
      with all styling preserved. You'll need to implement your own variable replacement
      logic when processing the template HTML on the server side.
    </div>
  </section>

  <section id="templating-examples" class="doc-section">
    <h3 class="subsection-title">Template Examples</h3>

    <h4 class="example-title">Example 1: Invoice Template</h4>
    <p><strong>Figma Text Layers:</strong></p>
    <ul class="doc-list">
      <li>Company name: "Acme Corporation"</li>
      <li>Invoice number: "[INVOICE_NUMBER]"</li>
      <li>Customer: "[CUSTOMER_NAME]"</li>
      <li>Amount: "[AMOUNT]"</li>
      <li>Date: "[DATE]"</li>
    </ul>

    <p class="mt-4"><strong>API Request Data:</strong></p>
    <div class="code-block">
      <pre><code
          >{`{
  "INVOICE_NUMBER": "INV-2024-001",
  "CUSTOMER_NAME": "John Smith",
  "AMOUNT": "$1,500.00",
  "DATE": "January 15, 2024"
}`}</code
        ></pre>
    </div>

    <h4 class="example-title mt-6">Example 2: Certificate Template</h4>
    <p><strong>Figma Text Layers:</strong></p>
    <ul class="doc-list">
      <li>Recipient: "{"{{recipient_name}}"}"</li>
      <li>Course: "{"{{course_title}}"}"</li>
      <li>Date: "{"{{completion_date}}"}"</li>
      <li>Instructor: "{"{{instructor_name}}"}"</li>
    </ul>

    <p class="mt-4"><strong>API Request Data:</strong></p>
    <div class="code-block">
      <pre><code
          >{`{
  "recipient_name": "Jane Doe",
  "course_title": "Advanced Web Development",
  "completion_date": "December 2024",
  "instructor_name": "Dr. Smith"
}`}</code
        ></pre>
    </div>

    <div class="tip-box mt-6">
      <strong>💡 Best Practice:</strong> Use consistent naming conventions across
      all your templates. This makes it easier to integrate with your systems and
      reduces errors.
    </div>
  </section>

  <section id="plugin" class="doc-section">
    <h2 class="section-title">Figma Plugin</h2>
    <p>
      The Templetto Figma plugin allows you to convert your Figma frames into
      HTML templates that can be saved to your account and used with the API.
    </p>

    <div class="feature-grid">
      <div class="feature-card-small">
        <strong>✓</strong> Real-time preview
      </div>
      <div class="feature-card-small">
        <strong>✓</strong> Export to HTML
      </div>
      <div class="feature-card-small">
        <strong>✓</strong> Auto-layout support
      </div>
      <div class="feature-card-small">
        <strong>✓</strong> Font preservation
      </div>
    </div>
  </section>

  <section id="plugin-setup" class="doc-section">
    <h3 class="subsection-title">Setup</h3>

    <div class="step-card">
      <div class="step-number">1</div>
      <div class="step-content">
        <h4>Install the Plugin</h4>
        <p>
          Open Figma and navigate to <strong>Plugins → Browse plugins</strong>.
          Search for "Templetto" and click install.
        </p>
      </div>
    </div>

    <div class="step-card">
      <div class="step-number">2</div>
      <div class="step-content">
        <h4>Sign In</h4>
        <p>
          Launch the plugin from <strong>Plugins → Templetto → Run</strong>.
          Click the login button and authenticate with your Templetto account.
        </p>
      </div>
    </div>

    <div class="step-card">
      <div class="step-number">3</div>
      <div class="step-content">
        <h4>Select Organization</h4>
        <p>
          Choose the organization where you want to save your templates. If
          you're on a personal account, your default organization will be
          selected automatically.
        </p>
      </div>
    </div>
  </section>

  <section id="plugin-workflow" class="doc-section">
    <h3 class="subsection-title">Workflow</h3>

    <h4 class="example-title">Creating a Template</h4>

    <div class="step-card">
      <div class="step-number">1</div>
      <div class="step-content">
        <h4>Design Your Template</h4>
        <p>
          Create a frame in Figma with your template design. Use auto-layout for
          best results. Add text layers with placeholder variables where you
          want dynamic content.
        </p>
        <div class="tip-box mt-3">
          <strong>Tip:</strong> Name your frame descriptively (e.g., "Invoice Template",
          "Certificate") for easy identification.
        </div>
      </div>
    </div>

    <div class="step-card">
      <div class="step-number">2</div>
      <div class="step-content">
        <h4>Select Frame</h4>
        <p>
          In the plugin, use the frame selector dropdown to choose the frame you
          want to convert to a template.
        </p>
      </div>
    </div>

    <div class="step-card">
      <div class="step-number">3</div>
      <div class="step-content">
        <h4>Preview</h4>
        <p>
          Click <strong>"Show Preview"</strong> to see how your template will render
          as HTML. You can toggle between visual preview and code view to inspect
          the generated HTML.
        </p>
      </div>
    </div>

    <div class="step-card">
      <div class="step-number">4</div>
      <div class="step-content">
        <h4>Save Template</h4>
        <p>
          Once you're satisfied with the preview, click <strong
            >"Save Template"</strong
          > to upload it to your account. The template will be stored with a unique
          ID that you can use with the API.
        </p>
      </div>
    </div>

    <div class="step-card">
      <div class="step-number">5</div>
      <div class="step-content">
        <h4>Get Template ID</h4>
        <p>
          Go to the <strong>"Templates"</strong> tab in the plugin to view all your
          saved templates. Copy the template ID to use in your API requests.
        </p>
      </div>
    </div>
  </section>

  <section id="plugin-config" class="doc-section">
    <h3 class="subsection-title">Configuration & Best Practices</h3>

    <h4 class="example-title">Frame Requirements</h4>
    <ul class="doc-list">
      <li>
        <strong>Auto-layout:</strong> Use auto-layout frames for better HTML conversion.
        Non-auto-layout frames may have positioning issues.
      </li>
      <li>
        <strong>Size:</strong> Set explicit width and height for your frame. This
        determines the PDF page size.
      </li>
      <li>
        <strong>Nesting:</strong> Nested frames are supported and will be converted
        to nested HTML div elements.
      </li>
    </ul>

    <h4 class="example-title mt-6">Page Size Configuration</h4>
    <p>
      The frame dimensions in Figma determine the output PDF page size. Common
      sizes:
    </p>
    <ul class="doc-list">
      <li>
        <strong>US Letter:</strong> 816 × 1056 px (8.5" × 11" at 96 DPI)
      </li>
      <li><strong>A4:</strong> 794 × 1123 px (210mm × 297mm at 96 DPI)</li>
      <li>
        <strong>Custom:</strong> Set any dimensions based on your requirements
      </li>
    </ul>

    <h4 class="example-title mt-6">Text & Typography</h4>
    <ul class="doc-list">
      <li>
        <strong>Web Fonts:</strong> Use Google Fonts for best compatibility. The
        plugin automatically includes font references in the generated HTML.
      </li>
      <li>
        <strong>Text Styling:</strong> Font weight, color, size, and alignment are
        preserved in the HTML output.
      </li>
      <li>
        <strong>Variables:</strong> Place variable placeholders directly in text
        layers using your preferred syntax convention.
      </li>
    </ul>

    <h4 class="example-title mt-6">Images</h4>
    <ul class="doc-list">
      <li>
        <strong>Image Fills:</strong> Frames with image fills are supported and exported
        as background images.
      </li>
      <li>
        <strong>Optimization:</strong> Images are automatically optimized during
        export.
      </li>
      <li>
        <strong>Format:</strong> Images are exported as PNG with transparency support.
      </li>
    </ul>

    <h4 class="example-title mt-6">Page Ordering</h4>
    <p>
      For multi-page templates, the order of frames in Figma determines the page
      order in the generated PDF. Arrange your frames from top to bottom or use
      frame naming with prefixes (e.g., "01-Cover", "02-Content") for explicit
      ordering.
    </p>

    <div class="warning-box mt-6">
      <strong>⚠️ Limitations:</strong>
      <ul class="doc-list mt-2">
        <li>Complex vector graphics may need to be rasterized</li>
        <li>
          Some Figma effects (like blur) may not translate perfectly to HTML
        </li>
        <li>Rotated elements have limited support</li>
        <li>Component instances are flattened during export</li>
      </ul>
    </div>

    <div class="tip-box mt-6">
      <strong>💡 Pro Tips:</strong>
      <ul class="doc-list mt-2">
        <li>Test your templates with sample data before production use</li>
        <li>Keep designs simple and structured for best HTML conversion</li>
        <li>
          Use consistent spacing and padding with auto-layout for reliable
          results
        </li>
        <li>Create a template library in Figma for reusable components</li>
      </ul>
    </div>
  </section>

  <section class="doc-section">
    <h2 class="section-title">Need Help?</h2>
    <p>If you have questions or run into issues, we're here to help:</p>
    <ul class="doc-list">
      <li>
        <a href="/contact_us" class="doc-link">Contact our support team</a>
      </li>
      <li>
        <a href="/account" class="doc-link">Visit your account dashboard</a>
      </li>
      <li>
        <a href="/pricing" class="doc-link">View pricing and usage limits</a>
      </li>
    </ul>
  </section>
</main>

<style>
  @media (max-width: 768px) {
    .docs-content {
      flex: 1;
      padding: 3rem;
      max-width: 900px;
      background: white;
      margin: 0 auto;
    }
  }

  @media (max-width: 768px) {
    .docs-content {
      padding: 2rem 1.5rem;
      margin-left: 0;
    }
  }

  .doc-section {
    margin-bottom: 4rem;
  }

  .doc-title {
    font-size: 2.5rem;
    font-weight: 800;
    color: #111827;
    margin-bottom: 1rem;
  }

  .doc-intro {
    font-size: 1.125rem;
    color: #4b5563;
    line-height: 1.75;
    margin-bottom: 2rem;
  }

  .section-title {
    font-size: 2rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 1rem;
    padding-top: 1rem;
    border-top: 2px solid #e5e7eb;
  }

  .subsection-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 1rem;
  }

  .example-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #374151;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
  }

  .param-title {
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
  }

  .doc-section p {
    line-height: 1.75;
    color: #374151;
    margin-bottom: 1rem;
  }

  .feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
  }

  .feature-card {
    padding: 1.5rem;
    border-radius: 0.5rem;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
  }

  .feature-card h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    margin-top: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .feature-card p {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
  }

  .feature-icon {
    font-size: 2rem;
  }

  .feature-card-small {
    padding: 1rem;
    border-radius: 0.375rem;
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    font-size: 0.875rem;
    color: #0c4a6e;
    text-align: center;
  }

  .info-box,
  .warning-box,
  .tip-box {
    padding: 1rem 1.25rem;
    border-radius: 0.5rem;
    margin: 1.5rem 0;
  }

  .info-box {
    background: #eff6ff;
    border-left: 4px solid #3b82f6;
    color: #1e40af;
  }

  .warning-box {
    background: #fef3c7;
    border-left: 4px solid #f59e0b;
    color: #92400e;
  }

  .tip-box {
    background: #d1fae5;
    border-left: 4px solid #10b981;
    color: #065f46;
  }

  .code-block {
    background: #1e293b;
    border-radius: 0.5rem;
    padding: 1.25rem;
    overflow-x: auto;
    margin: 1rem 0;
  }

  .code-block pre {
    margin: 0;
    color: #e2e8f0;
    font-family: "Fira Code", "Courier New", monospace;
    font-size: 0.875rem;
    line-height: 1.7;
  }

  .code-block code {
    color: #e2e8f0;
  }

  .inline-code {
    background: #f1f5f9;
    color: #0f172a;
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-family: "Fira Code", "Courier New", monospace;
    font-size: 0.875em;
  }

  .endpoint-card {
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin: 1.5rem 0;
    background: #fafafa;
  }

  .endpoint-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .http-method {
    background: #10b981;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 0.25rem;
    font-weight: 600;
    font-size: 0.875rem;
  }

  .endpoint-path {
    font-family: "Fira Code", "Courier New", monospace;
    font-size: 1rem;
    color: #111827;
  }

  .param-table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
    font-size: 0.875rem;
  }

  .param-table th {
    background: #f9fafb;
    text-align: left;
    padding: 0.75rem;
    font-weight: 600;
    color: #374151;
    border-bottom: 2px solid #e5e7eb;
  }

  .param-table td {
    padding: 0.75rem;
    border-bottom: 1px solid #e5e7eb;
    color: #4b5563;
  }

  .param-table code {
    background: #f1f5f9;
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-family: "Fira Code", "Courier New", monospace;
    font-size: 0.8125rem;
  }

  .doc-list {
    list-style: disc;
    padding-left: 1.5rem;
    margin: 1rem 0;
    color: #374151;
  }

  .doc-list li {
    margin-bottom: 0.5rem;
    line-height: 1.75;
  }

  .doc-link {
    color: #2563eb;
    text-decoration: underline;
    font-weight: 500;
  }

  .doc-link:hover {
    color: #1e40af;
  }

  .step-card {
    display: flex;
    gap: 1.5rem;
    margin: 1.5rem 0;
    padding: 1.5rem;
    background: #f9fafb;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
  }

  .step-number {
    flex-shrink: 0;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: #3b82f6;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.125rem;
  }

  .step-content h4 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 0.5rem;
  }

  .step-content p {
    margin: 0;
    color: #4b5563;
  }

  .mt-3 {
    margin-top: 0.75rem;
  }

  .mt-4 {
    margin-top: 1rem;
  }

  .mt-6 {
    margin-top: 1.5rem;
  }

  .mt-2 {
    margin-top: 0.5rem;
  }
</style>
