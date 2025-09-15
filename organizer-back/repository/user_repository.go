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
		SELECT u.id, u.first_name, u.last_name, u.email, u.username, u.password_hash, r.name AS role, u.created_at, u.updated_at 
		FROM users u
		JOIN roles r ON r.id = u.role_id
		WHERE u.username = $1
	`

	user := &models.User{}
	err := r.db.QueryRow(query, username).Scan(
		&user.ID,
		&user.FirstName,
		&user.LastName,
		&user.Email,
		&user.Username,
		&user.PasswordHash,
		&user.Role,
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
		SELECT u.id, u.first_name, u.last_name, u.email, u.username, u.password_hash, r.name AS role, u.created_at, u.updated_at 
		FROM users u
		JOIN roles r ON r.id = u.role_id
		WHERE u.email = $1
	`

	user := &models.User{}
	err := r.db.QueryRow(query, email).Scan(
		&user.ID,
		&user.FirstName,
		&user.LastName,
		&user.Email,
		&user.Username,
		&user.PasswordHash,
		&user.Role,
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
		INSERT INTO users (first_name, last_name, email, username, password_hash, role_id)
		VALUES ($1, $2, $3, $4, $5, (SELECT id FROM roles WHERE name = $6))
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(query,
		user.FirstName,
		user.LastName,
		user.Email,
		user.Username,
		user.PasswordHash,
		user.Role,
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
		WHERE username = $1 OR email = $2
	`

	var count int
	err := r.db.QueryRow(query, username, email).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("error checking user existence: %v", err)
	}

	return count > 0, nil
}

// GetUserByID retrieves a user by id
func (r *UserRepository) GetUserByID(id int) (*models.User, error) {
	query := `
        SELECT u.id, u.first_name, u.last_name, u.email, u.username, u.password_hash, r.name AS role, u.created_at, u.updated_at 
        FROM users u
        JOIN roles r ON r.id = u.role_id
        WHERE u.id = $1
    `

	user := &models.User{}
	err := r.db.QueryRow(query, id).Scan(
		&user.ID,
		&user.FirstName,
		&user.LastName,
		&user.Email,
		&user.Username,
		&user.PasswordHash,
		&user.Role,
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
func (r *UserRepository) ListUsers() ([]models.User, error) {
	query := `
        SELECT u.id, u.first_name, u.last_name, u.email, u.username, u.password_hash, r.name AS role, u.created_at, u.updated_at 
        FROM users u
        JOIN roles r ON r.id = u.role_id
        ORDER BY u.id ASC
    `

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("error listing users: %v", err)
	}
	defer rows.Close()

	users := []models.User{}
	for rows.Next() {
		var u models.User
		if err := rows.Scan(&u.ID, &u.FirstName, &u.LastName, &u.Email, &u.Username, &u.PasswordHash, &u.Role, &u.CreatedAt, &u.UpdatedAt); err != nil {
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
func (r *UserRepository) UpdateUser(user *models.User) error {
	query := `
        UPDATE users 
        SET first_name=$1, last_name=$2, email=$3, username=$4, password_hash=$5, role_id=(SELECT id FROM roles WHERE name=$6), updated_at=NOW()
        WHERE id=$7
        RETURNING updated_at
    `

	return r.db.QueryRow(query, user.FirstName, user.LastName, user.Email, user.Username, user.PasswordHash, user.Role, user.ID).Scan(&user.UpdatedAt)
}

// DeleteUser deletes a user by id
func (r *UserRepository) DeleteUser(id int) error {
	query := `DELETE FROM users WHERE id=$1`
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
func (r *UserRepository) CountUsers() (int, error) {
	query := `SELECT COUNT(*) FROM users`
	var count int
	if err := r.db.QueryRow(query).Scan(&count); err != nil {
		return 0, fmt.Errorf("error counting users: %v", err)
	}
	return count, nil
}
