CREATE TABLE channel_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id character varying(255),
  "user" character varying(255),
  bot_id character varying(255),
  reply_count INTEGER,
  subtype character varying(255),
  ts NUMERIC(20, 6),
  msg_date_time timestamp without time zone,
  created_at timestamp without time zone,
  parsed boolean,
  raw json
);
