package models

import (
	"time"
)

// User represents a user in the system
type User struct {
	ID           int       `json:"id" db:"id"`
	FirstName    string    `json:"first_name" db:"first_name"`
	LastName     string    `json:"last_name" db:"last_name"`
	Email        string    `json:"email" db:"email"`
	Username     string    `json:"username" db:"username"`
	PasswordHash string    `json:"-" db:"password_hash"`
	Role         string    `json:"role" db:"role"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

// UserCreateRequest represents the data needed to create a new user
type UserCreateRequest struct {
	FirstName string `json:"first_name" binding:"required"`
	LastName  string `json:"last_name" binding:"required"`
	Email     string `json:"email" binding:"required,email"`
	Username  string `json:"username" binding:"required"`
	Password  string `json:"password" binding:"required,min=6"`
	Role      string `json:"role" binding:"omitempty,oneof=admin generic"`
}

// UserResponse represents the user data returned in API responses
type UserResponse struct {
	ID        int       `json:"id"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	Email     string    `json:"email"`
	Username  string    `json:"username"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// ToResponse converts a User to UserResponse (hides password)
func (u *User) ToResponse() UserResponse {
	return UserResponse{
		ID:        u.ID,
		FirstName: u.FirstName,
		LastName:  u.LastName,
		Email:     u.Email,
		Username:  u.Username,
		Role:      u.Role,
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}
}

// UserUpdateRequest represents the data allowed to update an existing user
type UserUpdateRequest struct {
	FirstName string `json:"first_name" binding:"required"`
	LastName  string `json:"last_name" binding:"required"`
	Email     string `json:"email" binding:"required,email"`
	Username  string `json:"username" binding:"required"`
	Password  string `json:"password"`
	Role      string `json:"role" binding:"omitempty,oneof=admin generic"`
}
