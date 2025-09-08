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

// GetUserByID retrieves a user by id
func (r *SQLiteUserRepository) GetUserByID(id int) (*models.User, error) {
	query := `
        SELECT id, nombres, apellidos, correo, usuario, contrasena, created_at, updated_at 
        FROM users 
        WHERE id = ?
    `

	user := &models.User{}
	err := r.db.QueryRow(query, id).Scan(
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

// ListUsers returns all users
func (r *SQLiteUserRepository) ListUsers() ([]models.User, error) {
	query := `
        SELECT id, nombres, apellidos, correo, usuario, contrasena, created_at, updated_at 
        FROM users 
        ORDER BY id ASC
    `

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("error listing users: %v", err)
	}
	defer rows.Close()

	users := []models.User{}
	for rows.Next() {
		var u models.User
		if err := rows.Scan(&u.ID, &u.Nombres, &u.Apellidos, &u.Correo, &u.Usuario, &u.Contrasena, &u.CreatedAt, &u.UpdatedAt); err != nil {
			return nil, fmt.Errorf("error scanning user: %v", err)
		}
		users = append(users, u)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating users: %v", err)
	}
	return users, nil
}

// UpdateUser updates user fields by id
func (r *SQLiteUserRepository) UpdateUser(user *models.User) error {
	query := `
        UPDATE users 
        SET nombres=?, apellidos=?, correo=?, usuario=?, contrasena=?, updated_at=CURRENT_TIMESTAMP
        WHERE id=?
    `
	_, err := r.db.Exec(query, user.Nombres, user.Apellidos, user.Correo, user.Usuario, user.Contrasena, user.ID)
	return err
}

// DeleteUser deletes a user by id
func (r *SQLiteUserRepository) DeleteUser(id int) error {
	query := `DELETE FROM users WHERE id=?`
	res, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("error deleting user: %v", err)
	}
	affected, err := res.RowsAffected()
	if err != nil {
		return fmt.Errorf("error deleting user: %v", err)
	}
	if affected == 0 {
		return fmt.Errorf("user not found")
	}
	return nil
}

// CountUsers returns the total number of users
func (r *SQLiteUserRepository) CountUsers() (int, error) {
	query := `SELECT COUNT(*) FROM users`
	var count int
	if err := r.db.QueryRow(query).Scan(&count); err != nil {
		return 0, fmt.Errorf("error counting users: %v", err)
	}
	return count, nil
}
