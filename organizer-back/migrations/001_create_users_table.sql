-- Migration: 001_create_users_table.sql
-- Description: Create users table for authentication

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo VARCHAR(255) UNIQUE NOT NULL,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_correo ON users(correo);
CREATE INDEX IF NOT EXISTS idx_users_usuario ON users(usuario);

DO $$
BEGIN
  -- Only insert admin if it doesn't exist yet
  IF NOT EXISTS (SELECT 1 FROM users WHERE usuario = 'admin') THEN
    -- If schema already has role_id (e.g., DB was migrated further), include it in the insert
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role_id'
    ) THEN
      -- Insert with role_id if roles table exists; otherwise default to generic
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles') THEN
        INSERT INTO users (nombres, apellidos, correo, usuario, contrasena, role_id)
        VALUES (
          'Admin', 'User', 'admin@organizer.com', 'admin',
          '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
          (SELECT id FROM roles WHERE name = 'admin')
        );
      ELSE
        INSERT INTO users (nombres, apellidos, correo, usuario, contrasena, role_id)
        VALUES (
          'Admin', 'User', 'admin@organizer.com', 'admin',
          '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
          NULL
        );
      END IF;
    ELSE
      -- Legacy schema: no role_id column yet
      INSERT INTO users (nombres, apellidos, correo, usuario, contrasena)
      VALUES ('Admin', 'User', 'admin@organizer.com', 'admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');
    END IF;
  END IF;
END$$;
