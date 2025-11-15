package models

import (
	"gorm.io/gorm"
)

type Sources struct {
	gorm.Model
	Email        string  `json:"email" validate:"required,email"`      //добавить валидацию
	Phone_Number string  `json:"phonenumber" validate:"required",e164` //добавить валидацию
	Title        string  `json:"title"`
	X            float32 `json:"x"`
	Y            float32 `json:"y"`
	Addres       string  `json:"addres"`
	Is_Done      bool    `json:"completed"`
	Priority     string  `json:"priority"` //переделать под график работы
	UserID       int     `json:"user_id"`  // Внешний ключ
}
