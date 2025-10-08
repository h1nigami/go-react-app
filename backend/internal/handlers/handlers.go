package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/h1nigami/go-react-app/backend/internal/database"
	"github.com/h1nigami/go-react-app/backend/internal/models"
)

var db *database.DB = &database.DataBase

func AllTask(ctx *gin.Context) {
	tasks, err := db.GetTasks()
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err})
	}
	ctx.JSON(http.StatusOK, tasks)
	fmt.Printf("Айпи клиента %v\n", ctx.ClientIP())
}

func GetTaskById(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid data"})
		return
	}
	task, e := db.GetTaskByid(id)
	if e != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": e})
	}
	ctx.JSON(http.StatusOK, task)
}

func CreateTask(ctx *gin.Context) {
	var task models.Task
	if err := ctx.BindJSON(&task); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err})
	} else {
		db.CreateTask(&task)
		ctx.JSON(http.StatusCreated, task)
	}
}

func DeleteTask(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid data"})
		return
	}
	task := db.DeleteTask(id)
	ctx.JSON(http.StatusOK, gin.H{"deleted": task})
}
