CREATE TABLE channels (
  id character varying(255) PRIMARY KEY,
  name character varying(255),
  history_retrieved timestamp without time zone,
  created_at timestamp without time zone,
  raw json
);
