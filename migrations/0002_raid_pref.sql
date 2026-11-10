CREATE TABLE raid_pref (
  character_id INTEGER NOT NULL REFERENCES character (id) ON DELETE CASCADE,
  raid TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  PRIMARY KEY (character_id, raid)
);
