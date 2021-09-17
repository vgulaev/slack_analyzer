CREATE TABLE channels (
  id character varying(255) PRIMARY KEY,
  name character varying(255),
  created_at timestamp without time zone,
  raw json
);
