package models

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username string `json:"username" gorm:"uniqueIndex"`
	Password string `json:"-"` // Исключаем из JSON
	Tasks    []Task `json:"tasks"`
	// НЕ добавляем Tasks здесь - это создаст циклическую ссылку
}

type Task struct {
	gorm.Model
	Title    string `json:"title"`
	Is_Done  bool   `json:"completed"`
	Priority string `json:"priority"`
	UserID   uint   `json:"user_id"` // Внешний ключ
	// User     User   `json:"user" gorm:"foreignKey:UserID"` // Опционально, только если нужно
}
