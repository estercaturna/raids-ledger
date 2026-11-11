## 1. Worker responses

- [x] 1.1 Extend the header middleware in `src/index.ts` with `X-Content-Type-Options`, `X-Frame-Options` and the CSP
- [x] 1.2 Add a test asserting the four headers on an API response

## 2. Static assets

- [x] 2.1 Create `public/_headers` with the same four headers for `/*`

## 3. Verification

- [x] 3.1 Run `wrangler dev`, open the landing page and a tracker, and confirm no CSP errors in the console
- [x] 3.2 Exercise create, add/edit/delete character, clear a raid and history; confirm `curl -I` shows the headers for `/`, `/style.css`, `/api/meta` and `/t/<token>`
- [x] 3.3 Run typecheck and tests
