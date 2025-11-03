# Todos

## Plugin

### Auth

- use redirect url
- test expiration date comparisons
- bug: investigate why is the plugin constantly logging out.
- Create user org when Google Auth callback fires
- "Architect" auth flow to get the whole flow working well
- Use new user-organizations-join-table table in app
- pdf size:
  - Atm all pdf have A4 paper size. It should be defined by top level node e.g frame node.
- When creating new user they should be automatically assigned to a new organization

### The translator (figma -> html)

- Gather a set of test figma files
- Build snapshot tests for the test set
- pdf size:
  - Atm all pdf have A4 paper size. It should be defined by top level node e.g frame node.

#### Various

- handle jpg and other images
- handle svg shapes nodes
- handle boolean operation shapes nodes

#### Styles

- border styles
  - partial border (left, right etc.)
  - border with

## Webapp

"table" with list of templates
Show template thumbnail

- Remove firebase deps, externalize them instead like server app, then use turbo prune in dockerfile
  "Subscribe to our newsletter" CTA
  Email API provider (resend.com is in the starter kit)

Later - Render templates with dummy data

## Server

- [ ] make api.templetto.com work
- [ ] keep track of API Call usage (with potential to rate limit)

## Doc site

- API Docs
- # General docs
- invite user to a org

## Server

- introduce api.templetto.com subdomain
