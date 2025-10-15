package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Email    string   `json:"email" gorm:"uniqueIndex"`
	Username string   `json:"username" gorm:"uniqueIndex"`
	Password string   `json:"-"` // Исключаем из JSON
	Tasks    []string `json:"tasks"`
	// НЕ добавляем Tasks здесь - это создаст циклическую ссылку
}
