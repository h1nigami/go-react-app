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

// Источники
func AllSources(c *gin.Context) {
	Sourcess, err := storage.GetSourcess()
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
		src, err := storage.UpdateSources(id, Sources)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		}
		c.JSON(http.StatusOK, src)
	}

}

//Заявки

func AllOrders(c *gin.Context) {
	Orders, err := storage.GetOrders()
	if err != nil {
		c.AbortWithStatusJSON(http.StatusNotFound, gin.H{"error": err})
		return
	}
	c.JSON(http.StatusOK, Orders)
}

func CreateOrder(c *gin.Context) {
	id := c.Param("id")
	srcid, err := strconv.Atoi(id)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid data"})
		return
	}
	src, err := storage.GetSourcesByid(srcid)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusNotFound, gin.H{"error": err})
		return
	}
	var order models.Order
	if err := c.BindJSON(order); err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
	}
	storage.CreateOrder(int(src.ID), &order)
}

func OrderById(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
	}
	Order, err := storage.GetOrdersByid(id)
	if err != nil {
		c.AbortWithError(http.StatusNotFound, err)
	}
	c.JSON(http.StatusOK, Order)
}

func DeleteOrder(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
	}
	if err := storage.DeleteOrder(id); err != nil {
		c.AbortWithError(http.StatusNotFound, err)
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

// pkg
func Cities(c *gin.Context) {
	c.JSON(http.StatusOK, pkg.GetAllCities())
}

func GeoCode(c *gin.Context) {
	addres, err := pkg.GeoCoder(c.Param("addres"))
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"x": 1, "y": 1})
		return
	}
	coords := map[string]any{
		"x": addres[0].GeoLat,
		"y": addres[0].GeoLon,
	}
	c.JSON(http.StatusOK, coords)
}
