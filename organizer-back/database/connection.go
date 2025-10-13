package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

type db struct {
	host     string
	port     string
	user     string
	password string
	name     string
	sslmode  string
}

var DB *sql.DB

func NewDB() *db {
	log.Println("Creating new database...")
	return &db{
		host:     getEnv("DB_HOST", "localhost"),
		port:     getEnv("DB_PORT", "5432"),
		user:     getEnv("DB_USER", "organizer"),
		password: getEnv("DB_PASSWORD", "organizer123"),
		name:     getEnv("DB_NAME", "organizer"),
		sslmode:  getEnv("DB_SSLMODE", "disable"),
	}
}

// InitDB initializes the database connection
func (db *db) InitDB() error {
	log.Println("Initializing database...")
	psqlInfo := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		db.host, db.port, db.user, db.password, db.name, db.sslmode)

	var err error
	DB, err = sql.Open("postgres", psqlInfo)
	if err != nil {
		return fmt.Errorf("error opening database: %v", err)
	}

	// Test the connection
	if err = DB.Ping(); err != nil {
		return fmt.Errorf("error connecting to database: %v", err)
	}

	log.Println("Database connected successfully")
	return nil
}

// CloseDB closes the database connection
func (db *db) CloseDB() error {
	if DB != nil {
		return DB.Close()
	}
	return nil
}

// getEnv gets an environment variable with a default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
