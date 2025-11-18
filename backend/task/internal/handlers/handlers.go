package handlers

import (
	"log/slog"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/h1nigami/go-react-app/backend/task/internal/database"
	"github.com/h1nigami/go-react-app/backend/task/internal/models"
	"github.com/h1nigami/go-react-app/backend/task/pkg"
)

var storage database.SourcesStorage

func SetStorage(s database.SourcesStorage) {
	storage = s
}

var log *slog.Logger

func SetLogger(l *slog.Logger) {
	log = l
}

var validate = validator.New(validator.WithRequiredStructEnabled())

func AllSources(c *gin.Context) {
	uid, err := c.Cookie("user_id")
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	Sourcess, err := storage.GetSourcess(uid)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusNotFound, gin.H{"error": err})
		return
	}
	c.JSON(http.StatusOK, Sourcess)
}

func GetSourcesById(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid data"})
		return
	}
	Sources, e := storage.GetSourcesByid(id)
	if e != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": e})
	}
	c.JSON(http.StatusOK, Sources)
}

func CreateSources(c *gin.Context) {
	var Sources models.Sources
	if err := c.BindJSON(&Sources); err != nil {
		log.Info("Data from frontend", slog.Any("source", Sources))
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": err})
		return
	} else {
		ok := pkg.PhoneNumberValidator(Sources.Phone_Number)
		if !ok {
			slog.Error("validation error", slog.String("phone", Sources.Phone_Number))
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid phone number"})
		}
		if err := validate.Struct(Sources); err != nil {
			log.Error("validation error", slog.String("error", err.Error()))
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid data"})
			return
		}
		storage.CreateSources(&Sources)
		c.JSON(http.StatusCreated, Sources)
	}
}

func DeleteSources(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid data"})
		return
	}
	Sources := storage.DeleteSources(id)
	c.JSON(http.StatusOK, gin.H{"deleted": Sources})
}

func UpdateSources(c *gin.Context) {
	var Sources models.Sources
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid data"})
		return
	}
	if err := c.BindJSON(&Sources); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": err})
		return
	} else {
		storage.UpdateSources(id, Sources)
		c.JSON(http.StatusOK, Sources)
	}

}

func Cities(c *gin.Context) {
	c.JSON(http.StatusOK, pkg.GetAllCities())
}

func GeoCode(c *gin.Context) {
	addres, err := pkg.GeoCoder(c.Param("addres"))
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"x": 1, "y": 1})
	}
	coords := map[string]any{
		"x": addres[0].GeoLat,
		"y": addres[0].GeoLon,
	}
	c.JSON(http.StatusOK, coords)
}
