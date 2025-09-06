package models

import (
	"time"
)

// User represents a user in the system
type User struct {
	ID         int       `json:"id" db:"id"`
	Nombres    string    `json:"nombres" db:"nombres"`
	Apellidos  string    `json:"apellidos" db:"apellidos"`
	Correo     string    `json:"correo" db:"correo"`
	Usuario    string    `json:"usuario" db:"usuario"`
	Contrasena string    `json:"-" db:"contrasena"` // Hidden from JSON
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time `json:"updated_at" db:"updated_at"`
}

// UserCreateRequest represents the data needed to create a new user
type UserCreateRequest struct {
	Nombres   string `json:"nombres" binding:"required"`
	Apellidos string `json:"apellidos" binding:"required"`
	Correo    string `json:"correo" binding:"required,email"`
	Usuario   string `json:"usuario" binding:"required"`
	Contrasena string `json:"contrasena" binding:"required,min=6"`
}

// UserResponse represents the user data returned in API responses
type UserResponse struct {
	ID        int    `json:"id"`
	Nombres   string `json:"nombres"`
	Apellidos string `json:"apellidos"`
	Correo    string `json:"correo"`
	Usuario   string `json:"usuario"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// ToResponse converts a User to UserResponse (hides password)
func (u *User) ToResponse() UserResponse {
	return UserResponse{
		ID:        u.ID,
		Nombres:   u.Nombres,
		Apellidos: u.Apellidos,
		Correo:    u.Correo,
		Usuario:   u.Usuario,
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}
}
