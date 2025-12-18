# MVP 2 - SCOPE

## Webapp

- [x] Page "create token"
- [x] Page "remove account"
- [x] Page "usage meter"
- [wip] Template Detail Page
  - [x] visual preview
  - [x] html preview
  - [] resoureces preview - images, font links (optional)
  - [x] generated pdfs - list, remove, download
- [x] contact form

## Plugin

- [x] Create nice "Go back to plugin" page
- [x] Make sure image are included (base64) in templates when sending to the server. Atm it sends refernce to the Blob
- [x] Handle 'body too big'. Probably use streams when sending to the server

## Server

- [x] limit rate for all user actions and artifacts - pdfs, templates
- [x] fix pdf size - it should be saved in a tempalte information

## Bugs

- [x] when user is signed in in the app it interffers with plugin login flow
- [x] webapp: when logged in you can't go to public route by entering it in the browser, you will be redirected to /account
- [x] missing template id on template list page
- [x] missing max api calls number on webapge template list

## Testing

- [x] test auth flow in app and browser. Fix frequent logout if it turns out to be a real bug
- [x] review all TODO comments
