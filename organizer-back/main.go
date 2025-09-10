package main

import (
	"fmt"
	"log"
	"net/http"
	"organizer-back/database"
	"organizer-back/models"
	"organizer-back/services"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Remember bool   `json:"remember"`
}

type LoginResponse struct {
	Token string      `json:"token"`
	User  interface{} `json:"user"`
}

func main() {
	// Initialize database
	if err := database.InitDB(); err != nil {
		log.Fatal("Failed to initialize database:", err)
	}
	defer database.CloseDB()

	// Initialize services
	authService := services.NewAuthService()
	usersService := services.NewUsersService()

	r := gin.Default()

	// CORS for Angular dev server (adjust origin/ports if needed)
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:4200", "http://127.0.0.1:4200"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	api := r.Group("/api/v1")
	{
		api.POST("/auth/login", handleLogin(authService))
		api.POST("/auth/register", handleRegister(authService))
		api.GET("/healthz", func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"status": "ok"}) })

		// Users CRUD
		api.GET("/users", func(c *gin.Context) {
			users, err := usersService.ListUsers()
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusOK, users)
		})
		api.GET("/users/:id", func(c *gin.Context) {
			idParam := c.Param("id")
			var id int
			_, err := fmt.Sscanf(idParam, "%d", &id)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
				return
			}
			user, err := usersService.GetUser(id)
			if err != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusOK, user)
		})
		api.POST("/users", requireAdmin(), func(c *gin.Context) {
			var req models.UserCreateRequest
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			user, err := usersService.CreateUser(&req)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusCreated, user)
		})
		api.PUT("/users/:id", requireAdmin(), func(c *gin.Context) {
			idParam := c.Param("id")
			var id int
			_, err := fmt.Sscanf(idParam, "%d", &id)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
				return
			}
			var req models.UserUpdateRequest
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			user, err := usersService.UpdateUser(id, &req)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusOK, user)
		})
		api.DELETE("/users/:id", requireAdmin(), func(c *gin.Context) {
			idParam := c.Param("id")
			var id int
			_, err := fmt.Sscanf(idParam, "%d", &id)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
				return
			}
			if err := usersService.DeleteUser(id); err != nil {
				status := http.StatusBadRequest
				if err.Error() == "cannot delete the last user" {
					status = http.StatusForbidden
				}
				c.JSON(status, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusOK, gin.H{"message": "deleted"})
		})
	}

	r.Run(":8080")
}

func handleLogin(authService *services.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req LoginRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
			return
		}

		user, token, err := authService.Login(req.Username, req.Password)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
			return
		}

		c.JSON(http.StatusOK, LoginResponse{Token: token, User: user})
	}
}

func handleRegister(authService *services.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req models.UserCreateRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
			return
		}

		user, err := authService.Register(&req)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"message": "User created successfully", "user": user})
	}
}

// requireAdmin is a middleware that validates the Authorization header for an admin role
func requireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		role := extractRoleFromAuthHeader(c.GetHeader("Authorization"))
		if role != "admin" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "admin role required"})
			return
		}
		c.Next()
	}
}

func extractRoleFromAuthHeader(header string) string {
	if header == "" {
		return ""
	}
	parts := strings.SplitN(header, " ", 2)
	if len(parts) != 2 {
		return ""
	}
	tokenString := parts[1]
	token, _, err := new(jwt.Parser).ParseUnverified(tokenString, jwt.MapClaims{})
	if err != nil {
		return ""
	}
	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		if roleVal, ok2 := claims["role"]; ok2 {
			if s, ok3 := roleVal.(string); ok3 {
				return s
			}
		}
	}
	return ""
}
