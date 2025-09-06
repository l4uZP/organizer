package repository

import (
	"database/sql"
	"fmt"
	"organizer-back/database"
	"organizer-back/models"
)

type SQLiteUserRepository struct {
	db *sql.DB
}

func NewSQLiteUserRepository() *SQLiteUserRepository {
	return &SQLiteUserRepository{
		db: database.SQLiteDB,
	}
}

// GetUserByUsername retrieves a user by username
func (r *SQLiteUserRepository) GetUserByUsername(username string) (*models.User, error) {
	query := `
		SELECT id, nombres, apellidos, correo, usuario, contrasena, created_at, updated_at 
		FROM users 
		WHERE usuario = ?
	`
	
	user := &models.User{}
	err := r.db.QueryRow(query, username).Scan(
		&user.ID,
		&user.Nombres,
		&user.Apellidos,
		&user.Correo,
		&user.Usuario,
		&user.Contrasena,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("error querying user: %v", err)
	}
	
	return user, nil
}

// GetUserByEmail retrieves a user by email
func (r *SQLiteUserRepository) GetUserByEmail(email string) (*models.User, error) {
	query := `
		SELECT id, nombres, apellidos, correo, usuario, contrasena, created_at, updated_at 
		FROM users 
		WHERE correo = ?
	`
	
	user := &models.User{}
	err := r.db.QueryRow(query, email).Scan(
		&user.ID,
		&user.Nombres,
		&user.Apellidos,
		&user.Correo,
		&user.Usuario,
		&user.Contrasena,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("error querying user: %v", err)
	}
	
	return user, nil
}

// CreateUser creates a new user
func (r *SQLiteUserRepository) CreateUser(user *models.User) error {
	query := `
		INSERT INTO users (nombres, apellidos, correo, usuario, contrasena)
		VALUES (?, ?, ?, ?, ?)
	`
	
	result, err := r.db.Exec(query, 
		user.Nombres, 
		user.Apellidos, 
		user.Correo, 
		user.Usuario, 
		user.Contrasena)
	
	if err != nil {
		return fmt.Errorf("error creating user: %v", err)
	}
	
	// Get the last inserted ID
	id, err := result.LastInsertId()
	if err != nil {
		return fmt.Errorf("error getting last insert ID: %v", err)
	}
	
	user.ID = int(id)
	return nil
}

// UserExists checks if a user exists by username or email
func (r *SQLiteUserRepository) UserExists(username, email string) (bool, error) {
	query := `
		SELECT COUNT(*) 
		FROM users 
		WHERE usuario = ? OR correo = ?
	`
	
	var count int
	err := r.db.QueryRow(query, username, email).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("error checking user existence: %v", err)
	}
	
	return count > 0, nil
}
