CREATE TABLE users (
  id character varying(255) PRIMARY KEY,
  team_id character varying(255),
  name character varying(255),
  real_name character varying(255),
  email character varying(255),
  raw json
);
