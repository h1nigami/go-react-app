package database

import (
	"log"

	"github.com/glebarez/sqlite"
	"github.com/h1nigami/go-react-app/backend/auth/internal/models"
	"gorm.io/gorm"
)

type DB struct {
	pool *gorm.DB
}

func NewConnection(db_addrs string) DB {
	pool, err := gorm.Open(sqlite.Open(db_addrs), &gorm.Config{})
	if err != nil {
		log.Fatalf("Ошибка при подключении к бд: %s", err)
	}
	db := DB{pool: pool}
	log.Println("Подключение к бд успешно")
	db.pool.AutoMigrate(&models.User{})
	return db
}

func (d *DB) CreateUser(user *models.User) {
	d.pool.Create(&user)
}

func (d *DB) GetUsers() ([]models.User, error) {
	var users []models.User
	result := d.pool.Find(&users)
	return users, result.Error
}

func (d *DB) GetUserByID(id uint) (models.User, error) {
	var user models.User
	result := d.pool.Where("ID = ?", id).Find(&user)
	return user, result.Error
}

func (d *DB) DeleteUser(id uint) models.User {
	user, err := d.GetUserByID(id)
	if err != nil {
		log.Fatalf("Ошибка при удалении пользователя: ", err)
	}
	d.pool.Delete(&user)
	return user
}

var Db DB = NewConnection("auth.db")
