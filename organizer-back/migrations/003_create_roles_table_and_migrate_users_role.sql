-- Migration: 003_create_roles_table_and_migrate_users_role.sql
-- Description: Create roles table, migrate users.role to users.role_id, and enforce FK

BEGIN;

-- 1) Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2) Seed default roles
INSERT INTO roles (name) VALUES ('generic') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('admin') ON CONFLICT (name) DO NOTHING;

-- 3) Add users.role_id if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'role_id'
  ) THEN
    ALTER TABLE users ADD COLUMN role_id INTEGER;
  END IF;
END$$;

-- 4) Backfill users.role_id from users.role when present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    UPDATE users u
    SET role_id = r.id
    FROM roles r
    WHERE u.role = r.name AND u.role_id IS NULL;
  END IF;
END$$;

-- 5) Ensure every user has a role_id (default to 'generic')
UPDATE users 
SET role_id = (SELECT id FROM roles WHERE name = 'generic')
WHERE role_id IS NULL;

-- 6) Add FK constraint and index if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_role_id_fkey'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_role_id_fkey
      FOREIGN KEY (role_id)
      REFERENCES roles(id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);

-- 7) Make role_id NOT NULL
ALTER TABLE users ALTER COLUMN role_id SET NOT NULL;

-- 8) Drop legacy users.role column and any related constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_role_check;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE users DROP COLUMN role;
  END IF;
END$$;

COMMIT;


