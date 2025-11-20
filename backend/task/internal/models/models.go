package models

import (
	"gorm.io/gorm"
)

type Sources struct {
	gorm.Model
<<<<<<< HEAD
	Email         string  `json:"email" validate:"required,email"`       //добавить валидацию
	Phone_Number  string  `json:"phonenumber" validate:"required",e164"` //добавить валидацию
	Title         string  `json:"title"`
	Xfrom         float32 `json:"x_from"`
	Yfrom         float32 `json:"y_from"`
	Xto           float32 `json:"x_to"`
	Yto           float32 `json:"y_to"`
	Addres        `json:"addres"`
	ScheduleInput `json:"schedule"` //переделать под график работы
	UserID        int               `json:"user_id"` // Внешний ключ
=======
	Email         string `json:"email" validate:"required,email"`
	Phone_Number  string `json:"phonenumber" validate:"required",e164"`
	Title         string `json:"title"`
	ScheduleInput `json:"schedule"`
>>>>>>> 5a227fa (заявки)
}

type ScheduleInput struct {
	Days  string `json:"days"`
	Start string `json:"start"`
	End   string `json:"end"`
}

type Addres struct {
	From `json:"from"`
	To   `json:"to"`
}

type From struct {
	StreetFrom   string `json:"street"`
	NumberFrom   string `json:"number"`
	CityFrom     string `json:"city"`
	CountryFrom  string `json:"country"`
	DistrictFrom string `json:"district"`
	SubjectFrom  string `json:"subject"`
}

type To struct {
	StreetTo   string `json:"street"`
	NumberTo   string `json:"number"`
	CityTo     string `json:"city"`
	CountryTo  string `json:"country"`
	DistrictTo string `json:"district"`
	SubjectTo  string `json:"subject"`
}

type Order struct {
	gorm.Model
	Addres      `json:"addres"`
	From        `json:"from"`
	To          `json:"to"`
	Coordinates `json:"coordinates"`
	Source_id   int `json:"source_id"`
}

type Coordinates struct {
	X_from float32 `json:"x_from"`
	Y_from float32 `json:"y_from"`
	X_to   float32 `json:"x_to"`
	Y_to   float32 `json:"y_to"`
}
