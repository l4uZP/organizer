package services

import (
	"organizer-back/models"
	"organizer-back/repository"
	"time"
)

type NotesService struct {
	repo *repository.NoteRepository
}

func NewNotesService() *NotesService {
	return &NotesService{repo: repository.NewNoteRepository()}
}

func (s *NotesService) ListByUserAndDate(userID int, date string, includeHidden bool) ([]models.NoteResponse, error) {
	d, err := time.Parse("2006-01-02", date)
	if err != nil {
		return nil, err
	}
	notes, err := s.repo.ListByUserAndDate(userID, d, includeHidden)
	if err != nil {
		return nil, err
	}
	res := make([]models.NoteResponse, 0, len(notes))
	for i := range notes {
		res = append(res, notes[i].ToResponse())
	}
	return res, nil
}

func (s *NotesService) Create(userID int, req *models.NoteCreateRequest) (*models.NoteResponse, error) {
	d, err := time.Parse("2006-01-02", req.NoteDate)
	if err != nil {
		return nil, err
	}
	n, err := s.repo.Create(userID, d, req.Content)
	if err != nil {
		return nil, err
	}
	r := n.ToResponse()
	return &r, nil
}

func (s *NotesService) Get(userID, id int) (*models.NoteResponse, error) {
	n, err := s.repo.GetByID(userID, id)
	if err != nil {
		return nil, err
	}
	r := n.ToResponse()
	return &r, nil
}

func (s *NotesService) Update(userID, id int, req *models.NoteUpdateRequest) (*models.NoteResponse, error) {
	var dptr *time.Time
	if req.NoteDate != nil {
		d, err := time.Parse("2006-01-02", *req.NoteDate)
		if err != nil {
			return nil, err
		}
		dptr = &d
	}
	n, err := s.repo.Update(userID, id, dptr, req.Content, req.Hidden, req.Starred)
	if err != nil {
		return nil, err
	}
	r := n.ToResponse()
	return &r, nil
}

func (s *NotesService) Delete(userID, id int) error {
	return s.repo.Delete(userID, id)
}
