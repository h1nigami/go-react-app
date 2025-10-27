package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/h1nigami/go-react-app/backend/auth/internal/config"
	"github.com/h1nigami/go-react-app/backend/auth/internal/database"
	"github.com/h1nigami/go-react-app/backend/auth/internal/models"
	"golang.org/x/crypto/bcrypt"
)

var db *database.DB = &database.Db

var cfg = config.MustLoad()

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
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.Username,
		"exp": time.Now().Add(1 * time.Hour).Unix(),
	})
	tokenstr, err := token.SignedString([]byte(cfg.Secret_key))
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"failed to create token": err})
	}
	db.CreateUser(&user)
	c.SetCookie("token", tokenstr, 3600, "/", "localhost", false, true)
	c.JSON(http.StatusCreated, gin.H{"user": user, "token": tokenstr})
}
