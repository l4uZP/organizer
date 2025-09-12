-- Create notes table associated to users and a note date
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note_date DATE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index to speed up queries by user and date
CREATE INDEX IF NOT EXISTS idx_notes_user_date ON notes(user_id, note_date);

-- Trigger to update updated_at on update
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_timestamp_on_notes ON notes;
CREATE TRIGGER set_timestamp_on_notes
BEFORE UPDATE ON notes
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();


