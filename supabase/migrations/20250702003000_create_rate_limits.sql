CREATE TABLE IF NOT EXISTS
   rate_limits (
      id serial PRIMARY KEY,
      key text NOT NULL,
      window_start timestamptz NOT NULL,
      count integer NOT NULL,
      UNIQUE (key, window_start)
   );

CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON rate_limits (key);

CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits (window_start);