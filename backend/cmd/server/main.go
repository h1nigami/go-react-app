package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/h1nigami/go-react-app/backend/internal/handlers"
)

func main() {
	router := gin.Default()
	router.GET("/ping", func(ctx *gin.Context) { ctx.JSON(http.StatusOK, gin.H{"message": "pong"}) })
	router.GET("/tasks", handlers.AllTask)
	router.Run("localhost:8000")
}
