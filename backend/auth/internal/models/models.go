package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Email    string `json:"email" gorm:"uniqueIndex" validate:"required,email"`
	Username string `json:"username" gorm:"uniqueIndex"`
	Password string `json:"password" gorm:"type:text"` // Исключаем из JSON
}

type UserResponce struct {
	Email    string `json:"email"`
	Username string `json:"username"`
}
