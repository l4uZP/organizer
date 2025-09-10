package services

import (
	"errors"
	"organizer-back/models"
	"organizer-back/repository"
)

type UsersService struct {
	userRepo *repository.UserRepository
}

func NewUsersService() *UsersService {
	return &UsersService{userRepo: repository.NewUserRepository()}
}

func (s *UsersService) ListUsers() ([]models.UserResponse, error) {
	users, err := s.userRepo.ListUsers()
	if err != nil {
		return nil, err
	}
	responses := make([]models.UserResponse, 0, len(users))
	for i := range users {
		responses = append(responses, users[i].ToResponse())
	}
	return responses, nil
}

func (s *UsersService) GetUser(id int) (*models.UserResponse, error) {
	u, err := s.userRepo.GetUserByID(id)
	if err != nil {
		return nil, err
	}
	r := u.ToResponse()
	return &r, nil
}

func (s *UsersService) CreateUser(req *models.UserCreateRequest) (*models.UserResponse, error) {
	// Prevent duplicates
	exists, err := s.userRepo.UserExists(req.Usuario, req.Correo)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("user already exists")
	}

	// Hash password using AuthService method to avoid duplication
	auth := NewAuthService()
	hashed, err := auth.hashPassword(req.Contrasena)
	if err != nil {
		return nil, err
	}

	u := &models.User{
		Nombres:    req.Nombres,
		Apellidos:  req.Apellidos,
		Correo:     req.Correo,
		Usuario:    req.Usuario,
		Contrasena: hashed,
		Role:       defaultRole(req.Role),
	}
	if err := s.userRepo.CreateUser(u); err != nil {
		return nil, err
	}
	r := u.ToResponse()
	return &r, nil
}

func (s *UsersService) UpdateUser(id int, req *models.UserUpdateRequest) (*models.UserResponse, error) {
	current, err := s.userRepo.GetUserByID(id)
	if err != nil {
		return nil, err
	}

	// If changing username/email, it's ok as long as DB constraints allow; ideally check duplicates
	current.Nombres = req.Nombres
	current.Apellidos = req.Apellidos
	current.Correo = req.Correo
	current.Usuario = req.Usuario
	if req.Role != "" {
		current.Role = defaultRole(req.Role)
	}

	if req.Contrasena != "" {
		auth := NewAuthService()
		hashed, err := auth.hashPassword(req.Contrasena)
		if err != nil {
			return nil, err
		}
		current.Contrasena = hashed
	}

	if err := s.userRepo.UpdateUser(current); err != nil {
		return nil, err
	}
	r := current.ToResponse()
	return &r, nil
}

func (s *UsersService) DeleteUser(id int) error {
	count, err := s.userRepo.CountUsers()
	if err != nil {
		return err
	}
	if count <= 1 {
		return errors.New("cannot delete the last user")
	}
	return s.userRepo.DeleteUser(id)
}

func (s *UsersService) CountUsers() (int, error) {
	return s.userRepo.CountUsers()
}
