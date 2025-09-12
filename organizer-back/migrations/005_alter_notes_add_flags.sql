-- Add hidden and starred flags to notes
ALTER TABLE notes
  ADD COLUMN IF NOT EXISTS hidden BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS starred BOOLEAN NOT NULL DEFAULT FALSE;

-- Optional composite index to help common queries by date and flags
CREATE INDEX IF NOT EXISTS idx_notes_user_date_flags ON notes(user_id, note_date, starred, hidden, created_at);


