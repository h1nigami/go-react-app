package models

import (
	"gorm.io/gorm"
)

type Task struct {
	gorm.Model
	Title    string `json:"title"`
	Is_Done  bool   `json:"completed"`
	Priority string `json:"priority"`
}

type User struct {
	gorm.Model
	Username string
	Password string
}
