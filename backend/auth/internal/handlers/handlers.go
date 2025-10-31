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

type LoginRequest struct {
	Identifier string `json:"identifier" binding:"required"` // email or username
	Password   string `json:"password" binding:"required"`
}

var db = &database.Db

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
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	ok := email_validator(user)
	if ok {
		// Check if user already exists
		_, err := db.GetUserByEmailOrUsername(user.Email)
		if err == nil {
			c.AbortWithStatusJSON(http.StatusConflict, gin.H{"error": "user already exists"})
			return
		}
		_, err = db.GetUserByEmailOrUsername(user.Username)
		if err == nil {
			c.AbortWithStatusJSON(http.StatusConflict, gin.H{"error": "username already exists"})
			return
		}

		hashedPass, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		user.Password = string(hashedPass)
		db.CreateUser(&user)
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"sub":     user.Username,
			"exp":     time.Now().Add(1 * time.Hour).Unix(),
			"user_id": user.ID,
			"email":   user.Email,
		})
		tokenstr, err := token.SignedString([]byte(cfg.Secret_key))
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "failed to create token"})
			return
		}
		c.SetCookie("token", tokenstr, 3600, "/", "localhost", false, true)
		c.JSON(http.StatusCreated, gin.H{"user": user, "token": tokenstr})
		log.Info("Новый пользователь", slog.Any("email", user.Email),
			slog.Any("login", user.Username))
	} else {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid email"})
		log.Error("ошибка при регистрации")
	}
}

func LoginHandler(c *gin.Context) {
	var req LoginRequest
	if err := c.BindJSON(&req); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := db.GetUserByEmailOrUsername(req.Identifier)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":     user.Username,
		"exp":     time.Now().Add(1 * time.Hour).Unix(),
		"user_id": user.ID,
	})
	tokenstr, err := token.SignedString([]byte(cfg.Secret_key))
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "failed to create token"})
		return
	}

	c.SetCookie("token", tokenstr, 3600, "/", "localhost", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "login successful", "token": tokenstr})
	log.Info("Пользователь вошел в систему", slog.String("username", user.Username))
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := c.Cookie("token")
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "no token"})
			return
		}

		claims := jwt.MapClaims{}
		parsedToken, err := jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(cfg.Secret_key), nil
		})
		if err != nil || !parsedToken.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}

		c.Set("user_id", claims["user_id"])
		c.Set("username", claims["sub"])
		c.Next()
	}
}

func VerifyHandler(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	username, _ := c.Get("username")
	c.JSON(http.StatusOK, gin.H{"user_id": userID, "username": username})
}
