# Purchase inquiry review — November 4, 2026

Prepared against main 6e3c7be. Reuses the form section, styles, contact validation, provider integration shape and menu behavior from PR #1 (5b8e8d0), adapting one shared controller for the homepage and both cabins. No publication or live submissions performed.

## Buyer experience

Both listings keep their original call links, prices, inventory facts, metadata and sales copy. The additional **Ask About This Home** link reaches an inline form collecting name, phone and/or email, and inquiry. The cabin is displayed read-only; the controller supplies cabin name, SKU, price and source URL from the listing configuration. Delivery remains extra. An inquiry does not reserve or purchase the home.

The existing Start a Project section is included on the current homepage, preserving all later main-branch work. It uses the same controller. No photography changes are included.

## Verified results

| Check | Result |
| --- | --- |
| Browser form scenarios using synthetic data and intercepted provider responses | 20/20 passed |
| Approval disabled, blank endpoint, invalid endpoint | Zero requests |
| Required fields/whitespace, invalid email, missing/invalid phone | Rejected |
| Phone-only and email-only paths | Accepted by mock provider |
| Honeypot and instantaneous fill | Zero requests |
| Concurrent submit events | One request |
| Repeat identical accepted inquiry, new frame in same session, blocked-storage fallback | Duplicate suppressed |
| Rejection, network failure, malformed response, timeout | No success claim; data retained; controls released |
| Retry after rejection | Success; same inquiry reference |
| Both cabin payloads, attempted cabin field tampering, prices, listing URLs | Correct |
| Successful submission | Provider acknowledgment required; form reset |
| No-JavaScript state | Submit button disabled; telephone fallback present |
| Cabin 1 and 2 layout at 320, 390, 768 and 1440 px | 8/8 passed: no page overflow, 16px fields, >=44px submit targets |
| Sales metadata, specs, prices, call links, headers/footers | Preservation check passed for both listings |
| Current homepage outside two approved additions | Byte-identical |
| Twelve other content/configuration files | Unchanged |
| JS syntax and git whitespace checks | Passed |
| Actual Formspree dashboard and recipient inbox delivery | NOT VERIFIED; activation pending |

Browser testing used Chromium through the preview environment. Mobile checks used constrained iframe viewports, not a physical phone or mobile Safari. The HTTP preview lacks native Web Crypto; the isolated test harness supplies a deterministic test-only digest/UUID shim. Production app.js uses native SHA-256 and randomUUID on HTTPS and contains no test transport or weak digest fallback. CSP blocks outbound connections in each test frame in addition to intercepting fetch. No external provider received synthetic inquiries.

To reproduce, serve the repository locally and open tests/browser-inquiries.html. On HTTPS it uses native Web Crypto. Run `python tests/check-preservation.py`, `node --check app.js`, and `node --check tests/browser-inquiries.js`. Exclude tests from production upload.

## Decisions required

- Approve the exact receiving mailbox(es). None is configured or assumed.
- Approve the final cabin forms and homepage Start a Project section.
- Approve configuration and controlled delivery testing, followed by publication of the five changed website files using the existing domain/hosting route once delivery is verified.

See FORM_SETUP.md for exact provider setup, response-contract verification, delivery checks, deployment scope and duplicate/spam limitations. Submissions remain disabled until those decisions and checks are complete.
