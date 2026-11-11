## ADDED Requirements

### Requirement: Security headers on every response
The system SHALL return `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer` and a `Content-Security-Policy` on every response, including API responses, the tracker page and static assets.

#### Scenario: API response
- **WHEN** a client requests any `/api/*` endpoint
- **THEN** the response includes all four security headers

#### Scenario: Static page
- **WHEN** a client requests the landing page or a static asset
- **THEN** the response includes all four security headers

#### Scenario: Tracker page
- **WHEN** a client opens a tracker link
- **THEN** the response includes all four security headers

### Requirement: Same-origin content policy
The Content-Security-Policy SHALL restrict scripts, styles, images, fonts and network connections to the site's own origin, and SHALL forbid framing and form submission to other origins.

#### Scenario: Site keeps working
- **WHEN** the landing page and a tracker are used under the policy
- **THEN** no resource is blocked and all features (create, edit, clear, history) work

#### Scenario: External resource
- **WHEN** a page tries to load a script or image from another origin
- **THEN** the browser blocks it
