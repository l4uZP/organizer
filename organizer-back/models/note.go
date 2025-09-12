package models

import "time"

// Note represents a personal note associated to a user and a specific date
type Note struct {
	ID        int       `json:"id" db:"id"`
	UserID    int       `json:"user_id" db:"user_id"`
	NoteDate  time.Time `json:"-" db:"note_date"`
	Content   string    `json:"content" db:"content"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

// NoteResponse is returned to clients with date formatted as YYYY-MM-DD
type NoteResponse struct {
	ID        int       `json:"id"`
	UserID    int       `json:"user_id"`
	NoteDate  string    `json:"note_date"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// ToResponse converts Note to NoteResponse formatting the date
func (n *Note) ToResponse() NoteResponse {
	return NoteResponse{
		ID:        n.ID,
		UserID:    n.UserID,
		NoteDate:  n.NoteDate.Format("2006-01-02"),
		Content:   n.Content,
		CreatedAt: n.CreatedAt,
		UpdatedAt: n.UpdatedAt,
	}
}

// NoteCreateRequest payload for creating a note
type NoteCreateRequest struct {
	NoteDate string `json:"note_date" binding:"required"`
	Content  string `json:"content" binding:"required"`
}

// NoteUpdateRequest payload for updating a note
type NoteUpdateRequest struct {
	NoteDate *string `json:"note_date,omitempty"`
	Content  *string `json:"content,omitempty"`
}
