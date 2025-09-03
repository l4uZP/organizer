package main

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Remember bool   `json:"remember"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  string `json:"user"`
}

func main() {
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
		api.POST("/auth/login", handleLogin)
		api.GET("/healthz", func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"status": "ok"}) })
	}

	r.Run(":8080")
}

func handleLogin(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
		return
	}

	if req.Username == "admin" && req.Password == "admin" {
		c.JSON(http.StatusOK, LoginResponse{Token: "dummy-token", User: req.Username})
		return
	}

	c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
}
