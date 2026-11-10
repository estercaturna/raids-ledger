ALTER TABLE character ADD COLUMN position INTEGER NOT NULL DEFAULT 0;

UPDATE character SET position = (
  SELECT COUNT(*) FROM character o
  WHERE o.tracker_id = character.tracker_id
    AND (o.ilvl > character.ilvl OR (o.ilvl = character.ilvl AND o.name < character.name))
);
