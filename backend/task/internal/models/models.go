package models

import (
	"gorm.io/gorm"
)

type Sources struct {
	gorm.Model
	Email         string  `json:"email" validate:"required,email"`       //добавить валидацию
	Phone_Number  string  `json:"phonenumber" validate:"required",e164"` //добавить валидацию
	Title         string  `json:"title"`
	X             float32 `json:"x"`
	Y             float32 `json:"y"`
	Addres        `json:"addres"`
	ScheduleInput `json:"schedule"` //переделать под график работы
	UserID        int               `json:"user_id"` // Внешний ключ
}

type ScheduleInput struct {
	Days  string `json:"days"`
	Start string `json:"start"`
	End   string `json:"end"`
}

type Addres struct {
	Street   string `json:"street"`
	Number   string `json:"number"`
	City     string `json:"city"`
	Country  string `json:"country"`
	District string `json:"district"`
	Subject  string `json:"subject"`
}
