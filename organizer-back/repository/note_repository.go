package repository

import (
	"database/sql"
	"fmt"
	"organizer-back/database"
	"organizer-back/models"
	"time"
)

type NoteRepository struct {
	db *sql.DB
}

func NewNoteRepository() *NoteRepository {
	return &NoteRepository{db: database.DB}
}

func (r *NoteRepository) ListByUserAndDate(userID int, date time.Time) ([]models.Note, error) {
	query := `SELECT id, user_id, note_date, content, created_at, updated_at FROM notes WHERE user_id=$1 AND note_date=$2 ORDER BY id ASC`
	rows, err := r.db.Query(query, userID, date.Format("2006-01-02"))
	if err != nil {
		return nil, fmt.Errorf("error listing notes: %v", err)
	}
	defer rows.Close()

	var notes []models.Note
	for rows.Next() {
		var n models.Note
		if err := rows.Scan(&n.ID, &n.UserID, &n.NoteDate, &n.Content, &n.CreatedAt, &n.UpdatedAt); err != nil {
			return nil, fmt.Errorf("error scanning note: %v", err)
		}
		notes = append(notes, n)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating notes: %v", err)
	}
	return notes, nil
}

func (r *NoteRepository) Create(userID int, date time.Time, content string) (*models.Note, error) {
	query := `INSERT INTO notes (user_id, note_date, content) VALUES ($1, $2, $3) RETURNING id, created_at, updated_at`
	n := &models.Note{UserID: userID, NoteDate: date, Content: content}
	if err := r.db.QueryRow(query, userID, date.Format("2006-01-02"), content).Scan(&n.ID, &n.CreatedAt, &n.UpdatedAt); err != nil {
		return nil, fmt.Errorf("error creating note: %v", err)
	}
	return n, nil
}

func (r *NoteRepository) GetByID(userID, id int) (*models.Note, error) {
	query := `SELECT id, user_id, note_date, content, created_at, updated_at FROM notes WHERE id=$1 AND user_id=$2`
	var n models.Note
	if err := r.db.QueryRow(query, id, userID).Scan(&n.ID, &n.UserID, &n.NoteDate, &n.Content, &n.CreatedAt, &n.UpdatedAt); err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("note not found")
		}
		return nil, fmt.Errorf("error getting note: %v", err)
	}
	return &n, nil
}

func (r *NoteRepository) Update(userID, id int, date *time.Time, content *string) (*models.Note, error) {
	// Build dynamic update
	setClause := ""
	args := []interface{}{}
	idx := 1
	if date != nil {
		setClause += fmt.Sprintf("note_date=$%d, ", idx)
		args = append(args, date.Format("2006-01-02"))
		idx++
	}
	if content != nil {
		setClause += fmt.Sprintf("content=$%d, ", idx)
		args = append(args, *content)
		idx++
	}
	if setClause == "" {
		// nothing to update
		return r.GetByID(userID, id)
	}
	// trim trailing comma and space
	setClause = setClause[:len(setClause)-2]
	args = append(args, id, userID)
	query := fmt.Sprintf("UPDATE notes SET %s, updated_at=NOW() WHERE id=$%d AND user_id=$%d RETURNING id, user_id, note_date, content, created_at, updated_at", setClause, idx, idx+1)

	var n models.Note
	if err := r.db.QueryRow(query, args...).Scan(&n.ID, &n.UserID, &n.NoteDate, &n.Content, &n.CreatedAt, &n.UpdatedAt); err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("note not found")
		}
		return nil, fmt.Errorf("error updating note: %v", err)
	}
	return &n, nil
}

func (r *NoteRepository) Delete(userID, id int) error {
	res, err := r.db.Exec("DELETE FROM notes WHERE id=$1 AND user_id=$2", id, userID)
	if err != nil {
		return fmt.Errorf("error deleting note: %v", err)
	}
	affected, err := res.RowsAffected()
	if err != nil {
		return fmt.Errorf("error deleting note: %v", err)
	}
	if affected == 0 {
		return fmt.Errorf("note not found")
	}
	return nil
}
