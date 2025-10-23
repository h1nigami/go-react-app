package database

import (
	"fmt"
	"log"

	"github.com/glebarez/sqlite"
	"github.com/h1nigami/go-react-app/backend/task/internal/config"
	"github.com/h1nigami/go-react-app/backend/task/internal/models"
	"gorm.io/gorm"
)

type DB struct {
	pool *gorm.DB
}

func NewConnection(db_name string) (*DB, error) {
	const op = "database.database.NewConnection"

	db, err := gorm.Open(sqlite.Open(db_name), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("Ошибка в функции %v: %v", op, err)
	}
	log.Println("подключение к бд успешно")
	data := DB{pool: db}
	data.createTables()
	return &data, nil
}

func (d *DB) createTables() {
	d.pool.AutoMigrate(&models.Task{})
}

func (d *DB) CreateTask(task *models.Task) {
	d.pool.Create(&task)
}

func (d *DB) GetTasks() ([]models.Task, error) {
	var tasks []models.Task
	result := d.pool.Find(&tasks)
	return tasks, result.Error
}

func (d *DB) GetTaskByid(id int) (models.Task, error) {
	var task models.Task
	result := d.pool.Where("ID = ?", id).Find(&task)
	return task, result.Error
}

func (d *DB) Createtask(task *models.Task) {
	d.pool.Create(&task)
}

func (d *DB) DeleteTask(id int) models.Task {
	task, err := d.GetTaskByid(id)
	if err != nil {
		log.Fatal(err)
	}
	d.pool.Delete(&task)
	return task
}

func (d *DB) UpdateTask(id int, task models.Task) error {
	result := d.pool.Model(&models.Task{}).Where("ID = ?", id).Updates(task)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("task with ID %d not found", id)
	}

	return nil
}

var cfg *config.Config = config.MustLoad()
var DataBase *DB

func InitDatabase() error {
	const op = "InitDatabase in task service"
	db, err := NewConnection(cfg.StoragePath)
	if err != nil {
		return fmt.Errorf("%v : %v", op, err)
	}
	DataBase = db
	return nil
}
