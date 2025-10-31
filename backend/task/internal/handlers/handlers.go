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

func AllTask(c *gin.Context) {
	uid, _ := c.Get("user_id")
	tasks, err := storage.GetTasks(uid)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusNotFound, gin.H{"error": err})
		return
	}
	c.JSON(http.StatusOK, tasks)
	fmt.Printf("Айди клиента %v\n", uid)
}

func GetTaskById(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid data"})
		return
	}
	task, e := storage.GetTaskByid(id)
	if e != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": e})
	}
	c.JSON(http.StatusOK, task)
}

func CreateTask(c *gin.Context) {
	var task models.Task
	if err := c.BindJSON(&task); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": err})
	} else {
		storage.CreateTask(&task, 1)
		c.JSON(http.StatusCreated, task)
	}
}

func DeleteTask(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid data"})
		return
	}
	task := storage.DeleteTask(id)
	c.JSON(http.StatusOK, gin.H{"deleted": task})
}

func Updatetask(c *gin.Context) {
	var task models.Task
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid data"})
		return
	}
	if err := c.BindJSON(&task); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": err})
		return
	} else {
		storage.UpdateTask(id, task)
		c.JSON(http.StatusOK, task)

	}

}
