# MVP 2

Critical todos for mvp 2

## Webapp

- [] Check if docs are correct
- [] Page "create token"
- [] Page "remove account"
- [] Page "usage meter"
- [] Template Detail Page
  - [] code preview
  - [] html preview
  - [] resoureces preview - images, font links (optional)
  - [] generated pdfs - list, remove, download
- [] reset password
- [] contact form
- []

## Plugin

- [] test auth flow in app and browser. Fix frequent logout if it turns out to be a real bug
- [] Create nice "Go back to plugin" page
- [] Make sure image are included (base64) in templates when sending to the server. Atm it sends refernce to the Blob
- [] Handle 'body too big'. Probably use streams when sending to the server

## Server

- [] limit rate for all user actions and artifacts - pdfs, templates
