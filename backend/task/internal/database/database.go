package database

import (
	"fmt"
	"log/slog"

	"github.com/glebarez/sqlite"
	"github.com/h1nigami/go-react-app/backend/task/internal/config"
	"github.com/h1nigami/go-react-app/backend/task/internal/models"
	"gorm.io/gorm"
)

var log *slog.Logger

func SetLoger(l *slog.Logger) {
	log = l
}

type SourcesStorage interface {
	CreateSources(Sources *models.Sources)
	GetSourcess() ([]models.Sources, error)
	GetSourcesByid(id int) (models.Sources, error)
	DeleteSources(id int) models.Sources
	UpdateSources(id int, Sources models.Sources) (*models.Sources, error)
	CreateOrder(id int, order models.Order)
	GetOrders() ([]models.Order, error)
	GetOrdersByid(id int) (*models.Order, error)
	DeleteOrder(id int) error
	UpdateOrder(id int, order models.Order) error
}

type DB struct {
	pool *gorm.DB
}

func NewSqliteConnection(db_name string) (*DB, error) {
	const op = "database.database.NewSqliteConnection"

	db, err := gorm.Open(sqlite.Open(db_name), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("ошибка в функции %v: %v", op, err)
	}
	data := DB{pool: db}
	data.createTables()
	return &data, nil
}

func (d *DB) createTables() {
	d.pool.AutoMigrate(&models.Sources{})
	d.pool.AutoMigrate(&models.Order{})
}

// Источники
func (d *DB) GetSourcess() ([]models.Sources, error) {
	var Sourcess []models.Sources
	result := d.pool.Find(&Sourcess)
	return Sourcess, result.Error
}

func (d *DB) GetSourcesByid(id int) (models.Sources, error) {
	var Sources models.Sources
	result := d.pool.Where("ID = ?", id).Find(&Sources)
	return Sources, result.Error
}

func (d *DB) CreateSources(Sources *models.Sources) {
	d.pool.Create(&Sources)
}

func (d *DB) DeleteSources(id int) models.Sources {
	Sources, err := d.GetSourcesByid(id)
	if err != nil {
		log.Error("database error", slog.String("DeleteSources", err.Error()))
	}
	d.pool.Delete(&Sources)
	return Sources
}

func (d *DB) UpdateSources(id int, Sources models.Sources) (*models.Sources, error) {

	result := d.pool.Model(&models.Sources{}).Where("ID = ?", id).Updates(Sources)

	if result.Error != nil {
		return nil, result.Error
	}

	if result.RowsAffected == 0 {
		return nil, fmt.Errorf("sources with ID %d not found", id)
	}

	src, err := d.GetSourcesByid(id)
	if err != nil {
		return nil, err
	}

	return &src, nil
}

// Заявки
func (d *DB) CreateOrder(id int, order models.Order) {
	order.Source_id = id
	d.pool.Create(&order)
}

func (d *DB) GetOrders() ([]models.Order, error) {
	var Orders []models.Order
	result := d.pool.Find(&Orders)
	return Orders, result.Error
}

func (d *DB) GetOrdersByid(id int) (*models.Order, error) {
	var Order models.Order
	result := d.pool.Where("ID = ?", id).Find(&Order)
	if result.RowsAffected == 0 {
		return nil, fmt.Errorf("не удалось найти ордер с ID %v", id)
	}
	return &Order, nil
}

func (d *DB) DeleteOrder(id int) error {
	Order, err := d.GetOrdersByid(id)
	if err != nil {
		return err
	}
	d.pool.Delete(&Order)
	return nil
}

func (d *DB) UpdateOrder(id int, order models.Order) error {
	result := d.pool.Model(&models.Order{}).Where("ID = ?", id).Updates(order)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("не удалось найти ордер с ID %v", id)
	}
	return nil
}

// Заявки
func (d *DB) CreateOrder(id int, order models.Order) {
	order.Source_id = id
	d.pool.Create(&order)
}

func (d *DB) GetOrders() ([]models.Order, error) {
	var Orders []models.Order
	result := d.pool.Find(&Orders)
	return Orders, result.Error
}

func (d *DB) GetOrdersByid(id int) (*models.Order, error) {
	var Order models.Order
	result := d.pool.Where("ID = ?", id).Find(&Order)
	if result.RowsAffected == 0 {
		return nil, fmt.Errorf("не удалось найти ордер с ID %v", id)
	}
	return &Order, nil
}

func (d *DB) DeleteOrder(id int) error {
	Order, err := d.GetOrdersByid(id)
	if err != nil {
		return err
	}
	d.pool.Delete(&Order)
	return nil
}

func (d *DB) UpdateOrder(id int, order models.Order) error {
	result := d.pool.Model(&models.Order{}).Where("ID = ?", id).Updates(order)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("не удалось найти ордер с ID %v", id)
	}
	return nil
}

var cfg *config.Config = config.MustLoad()
var DataBase SourcesStorage

func InitSqliteDatabase() error {
	const op = "InitDatabase in Sources service"
	db, err := NewSqliteConnection(cfg.StoragePath)
	if err != nil {
		return fmt.Errorf("%v : %v", op, err)
	}
	DataBase = db
	return nil
}
