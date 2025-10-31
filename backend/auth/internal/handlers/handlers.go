package handlers

import (
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt/v5"
	"github.com/h1nigami/go-react-app/backend/auth/internal/config"
	"github.com/h1nigami/go-react-app/backend/auth/internal/database"
	"github.com/h1nigami/go-react-app/backend/auth/internal/models"
	"golang.org/x/crypto/bcrypt"
)

var db *database.DB = &database.Db

var cfg = config.MustLoad()

var log *slog.Logger

func SetLoger(l *slog.Logger) {
	log = l
}

func email_validator(user models.User) bool {
	validate := validator.New(validator.WithRequiredStructEnabled())
	err := validate.Struct(user)
	if err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			for _, ve := range validationErrors {
				fmt.Printf("ошибка в поле %s: тег = %s, значение = %v\n", ve.Field(), ve.Tag(), ve.Value())
				return false
			}
		} else {
			fmt.Printf("ошибка при валидации: %s", err)
			return false
		}
	}
	return true
}

func AuthHandler(c *gin.Context) {
	var user models.User

	if err := c.BindJSON(&user); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": err})
		return
	}
	ok := email_validator(user)
	if ok {
		hashedPass, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": err})
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
		log.Info("Новый пользователь", slog.Any("email", user.Email),
			slog.Any("login", user.Username),
			slog.Any("password", user.Password))
	} else {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid email"})
		log.Error("ошибка при регистрации")
	}
}
