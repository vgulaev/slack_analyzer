CREATE TABLE mentions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  msg_id uuid,
  ts NUMERIC(20, 6),
  msg_date_time timestamp without time zone,
  "user" character varying(255),
  mention character varying(255)
);
