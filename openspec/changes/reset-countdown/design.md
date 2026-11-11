## Context

`src/week.ts` computes the week start from `RESET_HOUR_UTC` (default 10, Wednesday). The payload already carries `weekStart`; the client formats dates in `tracker.js` and renders a rotation line above the toolbar.

## Goals / Non-Goals

**Goals:**
- Accurate countdown driven by the server's reset definition.

**Non-Goals:**
- Notifications or alerts on reset.

## Decisions

- **Server supplies `nextReset`** (week start + 7 days) so the reset hour stays configured in one place. A client-side Wednesday calculation was rejected because it would duplicate `RESET_HOUR_UTC`.
- **Tick every second** with `setInterval` so the seconds count down live.
- **On zero, refetch** the tracker data so the new week and cleared state appear.
- **Placement:** a small text line next to the week selector, styled like the existing pills, hidden for history weeks.

## Risks / Trade-offs

- A wrong device clock skews the countdown. Accepted; it is informational only.
