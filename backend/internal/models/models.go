package models

import (
	"gorm.io/gorm"
)

type Task struct {
	gorm.Model
	Title    string `json:"title"`
	Is_Done  bool   `json:"completed"`
	Priority int    `json:"priority"`
}
