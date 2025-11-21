package database_test

import (
	"log"
	"reflect"
	"testing"

	"github.com/h1nigami/go-react-app/backend/task/internal/database"
	"github.com/h1nigami/go-react-app/backend/task/internal/models"
	"gorm.io/gorm"
)

type TestDB struct {
	db *database.DB
}

func SetUpTestDB(t *testing.T) *TestDB {
	t.Helper()
	db, err := database.NewSqliteConnection(":memory:")
	if err != nil {
		log.Fatalf("Failed to create in-memory database: %v", err)
	}
	return &TestDB{db: db}
}

// очистка после тестов
func (tdb *TestDB) Cleanup(t *testing.T) {
	t.Helper()
	sqlDB, err := tdb.db.Pool.DB()
	if err != nil {
		sqlDB.Close()
	}

}

func TestDB_CreateSources(t *testing.T) {
	tdb := SetUpTestDB(t)
	defer tdb.Cleanup(t)

	tests := []struct {
		name    string
		sources *models.Sources
		wantErr bool
	}{
		{
			name: "Успешное создание источника",
			sources: &models.Sources{
				Title:        "Test Source",
				Email:        "test@example.com",
				Phone_Number: "89999999999",
			},
			wantErr: false,
		},
		{
			name: "Создание источника с пустым именем",
			sources: &models.Sources{
				Title:        "",
				Email:        "test@example.com",
				Phone_Number: "89999999999",
			},
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tdb.db.CreateSources(tt.sources)
			if tt.sources.ID <= 0 {
				t.Errorf("Id источника должен быть > 0, получено %d", tt.sources.ID)
			}
		})
	}

}

func TestDB_GetSouces(t *testing.T) {
	tdb := SetUpTestDB(t)
	defer tdb.Cleanup(t)

	testSources := []models.Sources{
		{Title: "Источник 1", Email: "test1@example.com", Phone_Number: "89999999999"},
		{Title: "Источник 1", Email: "test2@example.com", Phone_Number: "89999999999"},
		{Title: "Источник 3", Email: "test3@example.com", Phone_Number: "89999999999"},
	}

	for i := range testSources {
		tdb.db.CreateSources(&testSources[i])
	}

	t.Run("Получение всех источников", func(t *testing.T) {
		sources, err := tdb.db.GetSourcess()
		if err != nil {
			t.Errorf("Не удалось получить источники: %v", err)
		}
		if len(sources) != 3 {
			t.Errorf("Ожидалось получить 3 источника, получено %d", len(sources))
		}
		names := make([]string, len(sources))
		for i, s := range sources {
			names[i] = s.Title
		}
		expectedNames := []string{"Источник 1", "Источник 1", "Источник 3"}
		for _, exexpectedName := range expectedNames {
			found := false
			for _, name := range names {
				if name == exexpectedName {
					found = true
					break
				}
			}
			if !found {
				t.Errorf("Источник %s не найден в результате", exexpectedName)
			}
		}
	})

	t.Run("Получение источников из пустой бд", func(t *testing.T) {
		emptyDb := SetUpTestDB(t)
		defer emptyDb.Cleanup(t)

		sources, err := emptyDb.db.GetSourcess()
		if err != nil {
			t.Errorf("Ошибка при получении источников из пустой бд: %v", err)
		}
		if len(sources) != 0 {
			t.Errorf("Ожидалось 0 источникв, получено %d", len(sources))
		}
	})
}

func TestDB_GetSourceById(t *testing.T) {
	tdb := SetUpTestDB(t)
	defer tdb.Cleanup(t)

	t.Run("Получение существующего источника", func(t *testing.T) {
		testSource := &models.Sources{
			Title:        "Тестовый источник",
			Email:        "test@example.com",
			Phone_Number: "89999999999",
		}
		tdb.db.CreateSources(testSource)

		foundSource, err := tdb.db.GetSourcesByid(int(testSource.ID))
		if err != nil {
			t.Errorf("Ошибка при получении источника по ID: %v", err)
		}
		if !reflect.DeepEqual(testSource.Title, foundSource.Title) || testSource.Email != foundSource.Email || testSource.Phone_Number != foundSource.Phone_Number {
			t.Errorf("Источники не совпадают:\nОжидаемый: %v\nПолучен: %v", testSource, foundSource)
		}
	})

	t.Run("Получение несуществующего источника", func(t *testing.T) {
		_, err := tdb.db.GetSourcesByid(9999999)
		if err == nil {
			t.Errorf("Ожидалась ошибка для несуществующего ID, а получили nil")
		}
		if err != nil && err != gorm.ErrRecordNotFound {
			t.Errorf("Неожиданная ошибка: %v", err)
		}
	})
}
