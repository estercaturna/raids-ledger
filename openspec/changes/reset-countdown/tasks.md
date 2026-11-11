## 1. API

- [x] 1.1 Add a next-reset helper in `src/week.ts` (week start plus seven days) with a unit test
- [x] 1.2 Return `nextReset` in `GET /api/t/:token` and cover it in the API test

## 2. UI

- [x] 2.1 Add a countdown element to `public/tracker.html` and style it in `public/style.css`
- [x] 2.2 In `public/tracker.js`, render "Reset in Xd Xh Xm Xs", update every second, hide it for history weeks, and refetch when it reaches zero

## 3. Verification

- [x] 3.1 Run typecheck and tests
- [x] 3.2 Preview locally and check the current week, a history week and the zero case
