# Inquiry activation — owner approved, provider setup pending

Status: owner approved the receiving address **Sales@620fab.com**, final inquiry forms, controlled delivery testing, and publication after delivery verification. Approval recorded in this conversation; no further approval is required for that scope. `PROJECT_FORM_ENDPOINT = ''` and `PROJECT_FORM_ENABLED = false` in app.js. No form can send with this configuration. Nothing has been deployed.

## Findings

- Main at 6e3c7be has telephone inquiries only. CNAME is 620fab.com; no deployment workflow is tracked.
- PR #1 remains an unmerged draft at 5b8e8d0. Its setup selects Formspree but its endpoint is blank; no receiving address is specified.
- Searched current repository and existing PR configuration for form endpoints and receiving addresses; none was configured. Connected-mailbox Formspree search returned no messages. Provider account/dashboard access was not available, so an existing account cannot be ruled out.
- Approved receiving destination: **Sales@620fab.com**. Provider account sign-in, recipient verification and endpoint configuration remain pending. Do not assume delivery is configured merely because the destination is approved.

## Exact configuration needed

1. Complete: owner approved **Sales@620fab.com**, the final forms and the publication scope below.
2. In an owner-controlled Formspree account, create or identify a form for **620 Fabrication website inquiries**, verify the approved mailbox, and enable its email notification workflow. One endpoint handles both cabins and Start a Project. Notification subjects identify each cabin; fields include listing URL, SKU, asking price, buyer details, message and reference.
3. Obtain the exact public Integration endpoint `https://formspree.io/f/<actual-form-id>`. No private keys belong in the static site. Put that verified URL in `PROJECT_FORM_ENDPOINT` only after approval. Set `PROJECT_FORM_ENABLED` to true only for the approved activation.
4. Configure provider-side spam filtering and available domain restrictions for 620fab.com and its www host as appropriate. `_gotcha` is the provider-recognized honeypot. If the selected provider form requires CAPTCHA/Turnstile, implement and verify its actual challenge/token flow before enabling. Do not disable required protection merely to fit this draft. Confirm the selected workflow accepts phone-only inquiries; do not enable CRM integrations requiring email without revisiting that choice.
5. Confirm the real AJAX response contract matches the adapter (HTTP success plus JSON `ok: true`). Validate the actual response in a controlled test before public activation; provider acceptance does not prove notification inbox delivery.
6. Using synthetic contact information, verify Cabin 1, Cabin 2 and homepage project requests in the provider dashboard **and the approved inbox**. Verify correct cabin/price/source, phone-only and email-only inquiries, reply-to when email exists, spam handling, failure handling and duplicate-click behavior. No live test messages have been sent yet.
7. Publish only after explicit owner approval and delivery verification. Use the existing GitHub Pages/domain route after checking current hosting settings; DNS changes are not proposed. If the site is actually deployed through GoDaddy, confirm its deployment path first.

## Proposed publication scope

Publish index.html, cabin-1.html, cabin-2.html, app.js and styles.css together. Keep all existing assets, inventory.css, telephone links, metadata, prices, specs and sales copy. Add the PR #1 Start a Project section to current main without overwriting later SEO changes. Add a purchase inquiry on each cabin page and an additional hero anchor to reach it. The user also confirmed cabin pictures are available. Identifiable Cabin 1/Cabin 2 source images have not yet been located in the connected files; request their location or attachments before adding photographs. No gallery/admin changes have been deployed.

Do not upload `tests/`, `.preview/`, `.openai/`, or review documentation as website pages. No auto-merge or deployment is configured by this change. The draft branch does not replace PR #1; once this consolidated change is approved, close or supersede PR #1 to avoid reintroducing its older app.js.

## Duplicate/spam boundaries

In-flight submissions are guarded before hashing/network calls. Identical accepted content is blocked for ten minutes in the same tab/session, including page reloads, using a SHA-256 fingerprint rather than storing contact details. Memory fallback covers blocked session storage. A retry of unchanged data keeps its inquiry reference. Requests are aborted after 15 seconds; an ambiguous network result warns the buyer to call before retrying. No automatic retries.

This is client-side duplicate reduction, not server-side exactly-once delivery. Separate tabs/devices, altered content, direct requests or a provider timeout can still produce duplicates. Provider-side spam controls remain necessary; listing metadata is routing context, never trusted purchase/price authorization. HTTPS/Web Crypto is required for activation on the production domain.

Provider references: https://help.formspree.io/articles/building-your-form/honeypot-spam-filtering/ and https://help.formspree.io/articles/building-your-form/submit-forms-with-javascript-ajax .
