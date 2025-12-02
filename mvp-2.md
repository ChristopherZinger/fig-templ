# MVP 2

Critical todos for mvp 2

## Webapp

- [x] Page "create token"
- [x] Page "remove account"
- [x] Page "usage meter"
- [] Template Detail Page
  - [] code preview
  - [] html preview
  - [] resoureces preview - images, font links (optional)
  - [] generated pdfs - list, remove, download
- [] reset password
- [x] contact form

## Plugin

- [] Create nice "Go back to plugin" page
- [] Make sure image are included (base64) in templates when sending to the server. Atm it sends refernce to the Blob
- [] Handle 'body too big'. Probably use streams when sending to the server

## Server

- [] limit rate for all user actions and artifacts - pdfs, templates

## Bugs

- [] when user is signed in in the app it interffers with plugin login flow
- [] webapp: when logged in you can't go to public route by entering it in the browser, you will be redirected to /account
- [] telemetry logging is broken in webapp

## Testing

- [] Check if docs are correct
- [] test auth flow in app and browser. Fix frequent logout if it turns out to be a real bug
