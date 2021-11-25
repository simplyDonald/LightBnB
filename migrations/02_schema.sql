DROP TABLE IF EXISTS reservations CASCADE;

CREATE TABLE reservations(
  id INTEGER PRIMARY KEY NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  property_id INTEGER,
  guest_id INTEGER
)
