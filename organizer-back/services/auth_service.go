package services

import (
	"errors"
	"organizer-back/models"
	"organizer-back/repository"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	userRepo *repository.UserRepository
	jwtSecret string
}

func NewAuthService() *AuthService {
	return &AuthService{
		userRepo:  repository.NewUserRepository(),
		jwtSecret: "your-secret-key-change-in-production", // TODO: Move to environment variable
	}
}

// Login authenticates a user and returns a JWT token
func (s *AuthService) Login(username, password string) (*models.UserResponse, string, error) {
	// Get user from database
	user, err := s.userRepo.GetUserByUsername(username)
	if err != nil {
		return nil, "", errors.New("invalid credentials")
	}

	// Check password
	if !s.checkPassword(password, user.Contrasena) {
		return nil, "", errors.New("invalid credentials")
	}

	// Generate JWT token
	token, err := s.generateToken(user.ID, user.Usuario)
	if err != nil {
		return nil, "", err
	}

	// Return user response (without password) and token
	userResponse := user.ToResponse()
	return &userResponse, token, nil
}

// Register creates a new user
func (s *AuthService) Register(userReq *models.UserCreateRequest) (*models.UserResponse, error) {
	// Check if user already exists
	exists, err := s.userRepo.UserExists(userReq.Usuario, userReq.Correo)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("user already exists")
	}

	// Hash password
	hashedPassword, err := s.hashPassword(userReq.Contrasena)
	if err != nil {
		return nil, err
	}

	// Create user
	user := &models.User{
		Nombres:    userReq.Nombres,
		Apellidos:  userReq.Apellidos,
		Correo:     userReq.Correo,
		Usuario:    userReq.Usuario,
		Contrasena: hashedPassword,
	}

	err = s.userRepo.CreateUser(user)
	if err != nil {
		return nil, err
	}

	// Return user response (without password)
	userResponse := user.ToResponse()
	return &userResponse, nil
}

// hashPassword hashes a password using bcrypt
func (s *AuthService) hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// checkPassword verifies a password against its hash
func (s *AuthService) checkPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// generateToken creates a JWT token for the user
func (s *AuthService) generateToken(userID int, username string) (string, error) {
	claims := jwt.MapClaims{
		"user_id":  userID,
		"username": username,
		"exp":      time.Now().Add(time.Hour * 24).Unix(), // 24 hours
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}
