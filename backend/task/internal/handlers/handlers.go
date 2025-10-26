package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/h1nigami/go-react-app/backend/task/internal/database"
	"github.com/h1nigami/go-react-app/backend/task/internal/models"
)

var storage database.TaskStorage

func SetStorage(s database.TaskStorage) {
	storage = s
}

func AllTask(ctx *gin.Context) {
	tasks, err := storage.GetTasks()
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusNotFound, gin.H{"error": err})
		return
	}
	ctx.JSON(http.StatusOK, tasks)
	fmt.Printf("Айпи клиента %v\n", ctx.ClientIP())
}

func GetTaskById(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid data"})
		return
	}
	task, e := storage.GetTaskByid(id)
	if e != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": e})
	}
	ctx.JSON(http.StatusOK, task)
}

func CreateTask(ctx *gin.Context) {
	var task models.Task
	if err := ctx.BindJSON(&task); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": err})
	} else {
		storage.CreateTask(&task)
		ctx.JSON(http.StatusCreated, task)
	}
}

func DeleteTask(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid data"})
		return
	}
	task := storage.DeleteTask(id)
	ctx.JSON(http.StatusOK, gin.H{"deleted": task})
}

func Updatetask(ctx *gin.Context) {
	var task models.Task
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid data"})
		return
	}
	if err := ctx.BindJSON(&task); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": err})
		return
	} else {
		storage.UpdateTask(id, task)
		ctx.JSON(http.StatusOK, task)

	}

}
