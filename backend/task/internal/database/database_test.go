package database_test

import (
	"log"
	"testing"

	"github.com/h1nigami/go-react-app/backend/task/internal/database"
	"github.com/h1nigami/go-react-app/backend/task/internal/models"
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
