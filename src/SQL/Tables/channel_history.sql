CREATE TABLE channel_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id character varying(255),
  user_id character varying(255),
  ts NUMERIC(20, 6),
  reply_count INTEGER,
  parsed boolean,
  msg_date_time timestamp without time zone,
  history_retrieved timestamp without time zone,
  created_at timestamp without time zone,
  raw json
);
