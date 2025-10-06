package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/h1nigami/go-react-app/backend/internal/database"
)

var db database.DB = database.NewConnection("data.db")

func AllTask(ctx *gin.Context) {
	tasks, err := db.GetTasks()
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err})
	}
	ctx.JSON(http.StatusOK, tasks)
}
