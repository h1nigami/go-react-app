package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/h1nigami/go-react-app/backend/auth/internal/database"
	"github.com/h1nigami/go-react-app/backend/auth/internal/models"
	"golang.org/x/crypto/bcrypt"
)

var db *database.DB = &database.Db

func AuthHandler(c *gin.Context) {
	var user models.User
	if err := c.BindJSON(&user); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": err})
		return
	}
	hashedPass, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, map[string]any{"error": err})
		return
	}
	user.Password = string(hashedPass)
	db.CreateUser(&user)
	c.JSON(http.StatusCreated, user)
}
