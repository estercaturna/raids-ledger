CREATE TABLE tracker (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE character (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tracker_id TEXT NOT NULL REFERENCES tracker (id) ON DELETE CASCADE,
  name TEXT NOT NULL COLLATE NOCASE,
  class TEXT NOT NULL,
  ilvl REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (tracker_id, name)
);

CREATE TABLE clear (
  character_id INTEGER NOT NULL REFERENCES character (id) ON DELETE CASCADE,
  week_start TEXT NOT NULL,
  raid_key TEXT NOT NULL,
  cleared_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (character_id, week_start, raid_key)
);

CREATE INDEX idx_character_tracker ON character (tracker_id);
