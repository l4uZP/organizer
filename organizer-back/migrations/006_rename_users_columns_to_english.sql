-- Migration: 006_rename_users_columns_to_english.sql
-- Description: Rename users table columns and indexes from Spanish to English

BEGIN;

-- Conditionally rename columns if they still exist with Spanish names
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'nombres'
  ) THEN
    ALTER TABLE users RENAME COLUMN nombres TO first_name;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'apellidos'
  ) THEN
    ALTER TABLE users RENAME COLUMN apellidos TO last_name;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'correo'
  ) THEN
    ALTER TABLE users RENAME COLUMN correo TO email;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'usuario'
  ) THEN
    ALTER TABLE users RENAME COLUMN usuario TO username;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'contrasena'
  ) THEN
    ALTER TABLE users RENAME COLUMN contrasena TO password_hash;
  END IF;
END$$;

-- Drop old Spanish indexes if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_users_correo' AND n.nspname = 'public'
  ) THEN
    DROP INDEX idx_users_correo;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_users_usuario' AND n.nspname = 'public'
  ) THEN
    DROP INDEX idx_users_usuario;
  END IF;
END$$;

-- Create new English indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

COMMIT;


