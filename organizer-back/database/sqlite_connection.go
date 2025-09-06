package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

var SQLiteDB *sql.DB

// InitSQLiteDB initializes SQLite database connection
func InitSQLiteDB() error {
	// Create database directory if it doesn't exist
	if err := os.MkdirAll("data", 0755); err != nil {
		return fmt.Errorf("error creating data directory: %v", err)
	}

	// Connection string for SQLite
	dbPath := "data/organizer.db"
	
	var err error
	SQLiteDB, err = sql.Open("sqlite3", dbPath)
	if err != nil {
		return fmt.Errorf("error opening SQLite database: %v", err)
	}

	// Test the connection
	if err = SQLiteDB.Ping(); err != nil {
		return fmt.Errorf("error connecting to SQLite database: %v", err)
	}

	// Create users table
	if err := createUsersTable(); err != nil {
		return fmt.Errorf("error creating users table: %v", err)
	}

	// Insert default admin user
	if err := insertDefaultUser(); err != nil {
		return fmt.Errorf("error inserting default user: %v", err)
	}

	log.Println("SQLite database connected successfully")
	return nil
}

// createUsersTable creates the users table in SQLite
func createUsersTable() error {
	query := `
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		nombres TEXT NOT NULL,
		apellidos TEXT NOT NULL,
		correo TEXT UNIQUE NOT NULL,
		usuario TEXT UNIQUE NOT NULL,
		contrasena TEXT NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);
	`
	
	_, err := SQLiteDB.Exec(query)
	return err
}

// insertDefaultUser inserts the default admin user
func insertDefaultUser() error {
	// Check if admin user already exists
	var count int
	err := SQLiteDB.QueryRow("SELECT COUNT(*) FROM users WHERE usuario = ?", "admin").Scan(&count)
	if err != nil {
		return err
	}
	
	if count > 0 {
		return nil // User already exists
	}

	// Insert default admin user (password: admin123)
	// Hash: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
	query := `
	INSERT INTO users (nombres, apellidos, correo, usuario, contrasena) 
	VALUES (?, ?, ?, ?, ?)
	`
	
	_, err = SQLiteDB.Exec(query, 
		"Admin", 
		"User", 
		"admin@organizer.com", 
		"admin", 
		"$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi")
	
	return err
}

// CloseSQLiteDB closes the SQLite database connection
func CloseSQLiteDB() error {
	if SQLiteDB != nil {
		return SQLiteDB.Close()
	}
	return nil
}
