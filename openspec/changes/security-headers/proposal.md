## Why

The tracker is reached through a secret link that carries the token in the URL, and no response sets browser security headers. Adding them is a cheap way to keep the link from leaking and to limit what the pages can load or be embedded in.

## What Changes

- Add `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer` and a restrictive `Content-Security-Policy` (same-origin only) to every response.
- Cover both Worker responses (`/api/*`, `/t/*`) and static assets served from `public/`.
- No change to features, data or the API.

## Capabilities

### New Capabilities
- `security-headers`: browser-facing security headers returned on every response.

### Modified Capabilities
<!-- none -->

## Impact

- `src/index.ts`: extend the existing header middleware.
- `public/_headers`: new file so static assets get the same headers.
- Risk: a too strict CSP could break the pages, so it must be verified in a browser before deploy.
