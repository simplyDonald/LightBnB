DROP TABLE IF EXISTS property_reviews CASCADE;

CREATE TABLE property_reviews(
  id INTEGER PRIMARY KEY NOT NULL,
  guest_id INTEGER,
  property_id INTEGER,
  reservation_id INTEGER,
  rating SMALLINT,
  message TEXT
)