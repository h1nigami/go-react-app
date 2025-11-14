package models

import (
	"gorm.io/gorm"
)

type Task struct {
	gorm.Model
	Title    string  `json:"title"`
	X        float32 `json:"x"`
	Y        float32 `json:"y"`
	Addres   string  `json:"addres"`
	Is_Done  bool    `json:"completed"`
	Priority string  `json:"priority"`
	UserID   int     `json:"user_id"` // Внешний ключ
	// User     User   `json:"user" gorm:"foreignKey:UserID"` // Опционально, только если нужно
}
