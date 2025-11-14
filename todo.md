# Todos

## Plugin

- Allow multiple frames per template
- UX save template feedback
  - Navigate to templates list and highlight saved template after a template was saved

- JSON data preview
  - new sidepanel where user can view all variables included in the template as a json file.

- [??] Allow editing template before saving it in the db
  - I am not sure about this one but maybe user can manually fix html / or add styles that are not supported by the figma->html translator.

### Auth

- use redirect url
- bug: investigate why is the plugin constantly logging out.
- Create user org when Google Auth callback fires
- "Architect" auth flow to get the whole flow working well
- When creating new user they should be automatically assigned to a new organization
  - firebase auth trigger or explicit creation on login e.g when handling pkce key?

### Various

- Gather a set of test figma files

### The translator (figma -> html)

- Build snapshot tests for the test set
- pdf size:
  - ensure generated pdfs have correct size.
- handle rich text
- handle mixed text styles
- handle mixed border width
- handle links
- handle templating loops
  - I imagine this is a drag-drop component created by our plugin that will
    have some additional metadata that tells transformation script to wrap stuff
    in a {for each} loop

## Webapp

- create email collector form and hide unused pages for now.

"table" with list of templates
Show template thumbnail

- Remove firebase deps, externalize them instead like server app, then use turbo prune in dockerfile
  "Subscribe to our newsletter" CTA
  Email API provider (resend.com is in the starter kit)

Later - Render templates with dummy data

### Doc site

- [Amedee] API Docs

- invite user to a org

## Server

- [Chris] keep track of API Call usage (with potential to rate limit)
