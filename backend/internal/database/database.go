package database

import (
	"github.com/glebarez/sqlite"
	"github.com/h1nigami/go-react-app/backend/internal/models"
	"gorm.io/gorm"
)

type DB struct {
	pool *gorm.DB
}

func NewConnection(db_name string) DB {
	db, err := gorm.Open(sqlite.Open(db_name), &gorm.Config{})
	if err != nil {
		panic(err)
	}

	data := DB{pool: db}
	data.createTables()
	return data
}

func (d *DB) createTables() {
	d.pool.AutoMigrate(&models.Task{})
}

func (d *DB) CreateTask(task *models.Task) {
	d.pool.Create(&task)
}
