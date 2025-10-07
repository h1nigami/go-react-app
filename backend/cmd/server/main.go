package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/h1nigami/go-react-app/backend/internal/handlers"
)

func main() {
	router := gin.Default()
	router.SetTrustedProxies([]string{"127.0.0.1"})
	router.GET("/ping", func(ctx *gin.Context) { ctx.JSON(http.StatusOK, gin.H{"message": "pong_from " + ctx.ClientIP()}) })
	router.GET("/task", handlers.AllTask)
	router.GET("/task/:id", handlers.GetTaskById)
	router.POST("/task", handlers.CreateTask)
	router.Run("localhost:8000")
}
