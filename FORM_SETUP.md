# Project request form setup

The website is static and keeps its existing `620fab.com` custom domain. The quote form posts directly from the visitor's browser to Formspree; no mailbox password or API secret belongs in this repository. The site does not claim a submission succeeded until the provider accepts it.

1. In a Formspree account controlled by 620 Fabrication, verify the destination email address and create a form named **620 Fabrication project requests**. Copy its public endpoint from the form's Integration page (format `https://formspree.io/f/xxxxxxxx`).
2. Set `PROJECT_FORM_ENDPOINT` near the top of `app.js` to that exact URL. The form is intentionally unavailable until this is done and will show the phone number as a fallback.
3. Configure Formspree's notification recipient, spam settings, and allowed site/domain for `620fab.com` in the provider dashboard as appropriate. Do not commit credentials or a submission-read API key.
4. Publish the updated repository through the existing GitHub Pages setup. Submit a real test request on `https://620fab.com/`, confirm the success message, and confirm receipt in both the Formspree dashboard and destination inbox. Also test an invalid email and a request with neither phone nor email.

The GoDaddy DNS setting for `620fab.com` does not need to change if it continues to point at this GitHub Pages site. If the site is instead deployed by copying files into GoDaddy hosting, upload `index.html`, `styles.css`, and `app.js` together after configuring the endpoint.
