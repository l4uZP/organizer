package repository

import (
	"database/sql"
	"fmt"
	"organizer-back/database"
	"organizer-back/models"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository() *UserRepository {
	return &UserRepository{
		db: database.DB,
	}
}

// GetUserByUsername retrieves a user by username
func (r *UserRepository) GetUserByUsername(username string) (*models.User, error) {
	query := `
		SELECT id, nombres, apellidos, correo, usuario, contrasena, created_at, updated_at 
		FROM users 
		WHERE usuario = $1
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
func (r *UserRepository) GetUserByEmail(email string) (*models.User, error) {
	query := `
		SELECT id, nombres, apellidos, correo, usuario, contrasena, created_at, updated_at 
		FROM users 
		WHERE correo = $1
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
func (r *UserRepository) CreateUser(user *models.User) error {
	query := `
		INSERT INTO users (nombres, apellidos, correo, usuario, contrasena)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at
	`
	
	err := r.db.QueryRow(query, 
		user.Nombres, 
		user.Apellidos, 
		user.Correo, 
		user.Usuario, 
		user.Contrasena,
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
	
	if err != nil {
		return fmt.Errorf("error creating user: %v", err)
	}
	
	return nil
}

// UserExists checks if a user exists by username or email
func (r *UserRepository) UserExists(username, email string) (bool, error) {
	query := `
		SELECT COUNT(*) 
		FROM users 
		WHERE usuario = $1 OR correo = $2
	`
	
	var count int
	err := r.db.QueryRow(query, username, email).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("error checking user existence: %v", err)
	}
	
	return count > 0, nil
}
