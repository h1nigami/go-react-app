package models

import (
	"gorm.io/gorm"
)

type Task struct {
	gorm.Model
	Title    string `json:"title"`
	Is_Done  bool   `json:"completed"`
	Priority string `json:"priority"`
	UserID   uint   `json:"user_id"` // Внешний ключ
	// User     User   `json:"user" gorm:"foreignKey:UserID"` // Опционально, только если нужно
}
