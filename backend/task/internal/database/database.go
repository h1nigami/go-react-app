package database

import (
	"errors"
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
	GetSourcess(user_id any) ([]models.Sources, error)
	GetSourcesByid(id int) (models.Sources, error)
	DeleteSources(id int) models.Sources
	UpdateSources(id int, Sources models.Sources) error
	UpdateSourcesPriority(id int, Sources models.Sources) error
}

func (d *DB) UpdateSourcesPriority(id int, Sources models.Sources) error {
	const op = "database.UpdateSourcesPriority"
	err := fmt.Sprintf("no rows detected on %s", op)
	result := d.pool.Model(&models.Sources{}).Where("ID = ?", id).Updates(Sources)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.New(err)
	}

	return nil
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
}

func (d *DB) GetSourcess(user_id any) ([]models.Sources, error) {
	var Sourcess []models.Sources
	result := d.pool.Where("user_id = ?", user_id).Find(&Sourcess)
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

func (d *DB) UpdateSources(id int, Sources models.Sources) error {
	result := d.pool.Model(&models.Sources{}).Where("ID = ?", id).Updates(Sources)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("Sources with ID %d not found", id)
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
