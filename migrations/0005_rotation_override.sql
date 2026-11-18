CREATE TABLE rotation_override (
  tracker_id TEXT NOT NULL REFERENCES tracker (id) ON DELETE CASCADE,
  week_start TEXT NOT NULL,
  name TEXT NOT NULL,
  PRIMARY KEY (tracker_id, week_start)
);
