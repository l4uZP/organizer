-- Migration: 002_add_role_to_users.sql
-- Description: Add role column to users and seed admin role

ALTER TABLE users
ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'generic';

-- Ensure existing admin user has admin role
UPDATE users SET role = 'admin' WHERE usuario = 'admin';

-- Optional: basic constraint to allow only expected roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'generic'));
  END IF;
END$$;


