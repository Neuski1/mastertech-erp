-- Migration 062 — Schedule closures
-- Days the shop is closed: holidays, vacation, weather. One row per calendar
-- day so every calendar view can key on a single date with no range math.
-- Booking on a closed day is warned about, not blocked.

CREATE TABLE IF NOT EXISTS schedule_closures (
  id SERIAL PRIMARY KEY,
  closure_date DATE NOT NULL UNIQUE,
  label VARCHAR(100) NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schedule_closures_date ON schedule_closures(closure_date);
