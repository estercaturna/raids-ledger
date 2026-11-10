# Spec Delta

## Purpose

Persists a user's tracker on the server and gives access through a secret link, so no login is needed and data survives across devices and sessions.

## ADDED Requirements

### Requirement: Secret link issuance
The system SHALL create, for each new tracker, a secret link containing a cryptographically random, unguessable token, and display it to the user.

#### Scenario: New tracker
- **WHEN** the user creates a tracker
- **THEN** the user is given a link that opens that tracker and is told to keep it private

### Requirement: Access by link only
The system SHALL grant read and write access to a tracker only to requests presenting its valid token, without any login.

#### Scenario: Valid link
- **WHEN** a user opens a valid secret link
- **THEN** the tracker with its roster, clears and history is shown

#### Scenario: Invalid link
- **WHEN** a request presents an unknown token
- **THEN** the system responds as not found and reveals nothing about other trackers

### Requirement: Token not enumerable
The system SHALL NOT expose a way to list or search trackers, and SHALL NOT expose tokens in any public listing.

#### Scenario: No listing
- **WHEN** a client requests any listing of trackers
- **THEN** no such endpoint exists and no tokens are returned

### Requirement: Server-side persistence
The system SHALL store tracker data on the server so it is identical across devices using the same link.

#### Scenario: Second device
- **WHEN** a clear is saved on one device and the link is opened on another
- **THEN** the second device shows the saved clear
