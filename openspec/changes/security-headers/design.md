## Context

Dynamic responses already pass through a Hono middleware in `src/index.ts` that sets `Cache-Control: no-store` and `Referrer-Policy: no-referrer`. Static files in `public/` are served by Cloudflare assets directly, except `/api/*` and `/t/*` which run the Worker first (`run_worker_first`), so the middleware does not cover the rest. The pages have no inline scripts or styles and load only same-origin files; the only dynamic styling is CSSOM (`el.style.x = ...`), which CSP allows.

## Goals / Non-Goals

**Goals:**
- Same headers on Worker and static responses.
- A CSP that works without `'unsafe-inline'`.

**Non-Goals:**
- Rate limiting, token rotation, read-only links, HSTS preload.

## Decisions

- **Two places, one list:** the middleware sets headers for Worker responses, and `public/_headers` (`/*`) sets the same for assets. Alternative of running the Worker first for all paths was rejected: it adds a Worker invocation per asset.
- **CSP:** `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'`. `object-src` falls back to `default-src`.
- **Tracker page** is an asset fetched through the Worker, so it gets the middleware headers.

## Risks / Trade-offs

- A CSP violation would silently break a feature. Mitigation: run the site locally, open the console, and exercise create/edit/clear/history before deploy.
- The headers are duplicated in two places and can drift. Mitigation: a test asserting the middleware headers, plus a note in `_headers`.
