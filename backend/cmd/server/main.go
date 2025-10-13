package main

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/h1nigami/go-react-app/backend/internal/handlers"
)

func main() {
	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://127.0.0.1"},
		AllowMethods:     []string{"GET", "POST", "OPTIONS", "PUT", "DELETE", "PATCH"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	router.GET("/task", handlers.AllTask)
	router.GET("/task/:id", handlers.GetTaskById)
	router.POST("/task", handlers.CreateTask)
	router.DELETE("/task/:id", handlers.DeleteTask)
	router.PATCH("task/:id", handlers.Updatetask)
	router.Run("localhost:8000")
}
