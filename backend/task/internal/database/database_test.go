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

func TestDB_UpdateSources(t *testing.T) {
	tdb := SetUpTestDB(t)
	defer tdb.Cleanup(t)
	t.Run("Успешное обновление источника", func(t *testing.T) {
		originalSource := &models.Sources{
			Title:        "Исходное имя",
			Email:        "test@example.com",
			Phone_Number: "89999999999",
		}
		tdb.db.CreateSources(originalSource)
		updatedSources := &models.Sources{
			Title:        "Новое имя",
			Email:        "test1@example.com",
			Phone_Number: "89999999999",
		}
		result, err := tdb.db.UpdateSources(int(originalSource.ID), *updatedSources)
		if err != nil {
			t.Errorf("Ошибка при обновлении источника %v", err)
		}
		if result.Title != "Новое имя" {
			t.Errorf("Ожидалось имя 'Новое имя', получено '%s'", result.Title)
		}
		if result.Email != "test1@example.com" {
			t.Errorf("Ожидалось email 'test1@example.com', получено '%s'", result.Email)
		}
		foundSource, err := tdb.db.GetSourcesByid(int(originalSource.ID))
		if err != nil {
			t.Errorf("Ошибка при получении источника по ID: %v", err)
		}
		if foundSource.Title != "Новое имя" {
			t.Errorf("Изменения не сохранились в бд не: ожидалось имя 'Новое имя', получено '%s'", foundSource.Title)
		}
	})
	t.Run("Обновление несуществующего источника", func(t *testing.T) {
		updatedSource := models.Sources{
			Title: "Несуществующий источник",
		}
		_, err := tdb.db.UpdateSources(9999999, updatedSource)
		if err == nil {
			t.Errorf("Ожидалась ошибка для при обновлении несуществующего источника")
		}
		if err != nil && err.Error() != "sources with ID 9999999 not found" {
			t.Errorf("Неожиданная ошибка: %v", err)
		}
	})
}

func TestDB_DeleteSources(t *testing.T) {
	tdb := SetUpTestDB(t)
	defer tdb.Cleanup(t)

	t.Run("Успешное удаление источника", func(t *testing.T) {
		test := models.Sources{
			Title:        "Источник для удаления",
			Email:        "test@example.com",
			Phone_Number: "89999999999",
		}
		tdb.db.CreateSources(&test)
		deleted := tdb.db.DeleteSources(int(test.ID))
		if deleted.ID != test.ID {
			t.Errorf("ID удаленного источника не совпадает. Ожидалось %d получили %d", deleted.ID, test.ID)
		}
		_, err := tdb.db.GetSourcesByid(int(test.ID))
		if err == nil {
			t.Errorf("Источник должен быть удален из бд")
		}

	})
	t.Run("Удаление несущетсвующего источника", func(t *testing.T) {
		delete := tdb.db.DeleteSources(99999)

		if delete.ID != 0 {
			t.Errorf("Ожидался ID = 0 для несуществующего источника, получено %d", delete.ID)
		}
	})
}

func TestDB_CreateOrder(t *testing.T) {
	tdb := SetUpTestDB(t)
	defer tdb.Cleanup(t)

	t.Run("Создание заявки", func(t *testing.T) {
		src := models.Sources{
			Title:        "Источник для заявки",
			Email:        "test@example.com",
			Phone_Number: "89999999999",
		}
		tdb.db.CreateSources(&src)
		ord := models.Order{
			Addres: models.Addres{
				From: models.From{StreetFrom: "ул. Пушкина", NumberFrom: "123", CityFrom: "Москва", CountryFrom: "Россия"},
				To:   models.To{StreetTo: "ул. Дантеса", NumberTo: "123", CityTo: "Москва", CountryTo: "Россия"},
			},
			Coordinates: models.Coordinates{X_from: 1.0, Y_from: 2.0, X_to: 3.0, Y_to: 4.0},
		}
		tdb.db.CreateOrder(int(src.ID), &ord)
		ords, err := tdb.db.GetOrders()
		if err != nil {
			t.Errorf("Ошибка при получении заявок: %v", err)
		}
		if len(ords) != 1 {
			t.Errorf("Ожидалось 1 заявка, получено %d", len(ords))
		}
		if ords[0].Source_id != int(src.ID) {
			t.Errorf("Ожидался Source_id = %d, получено %d", src.ID, ords[0].Source_id)
		}
	})
}

func TestDB_GetOrders(t *testing.T) {
	tdb := SetUpTestDB(t)
	defer tdb.Cleanup(t)

	source := models.Sources{
		Title: "Источник",
	}
	tdb.db.CreateSources(&source)

	testOrders := []models.Order{
		models.Order{
			Addres: models.Addres{
				From: models.From{StreetFrom: "ул. Пушкина", NumberFrom: "123", CityFrom: "Москва", CountryFrom: "Россия"},
				To:   models.To{StreetTo: "ул. Дантеса", NumberTo: "123", CityTo: "Москва", CountryTo: "Россия"},
			},
			Coordinates: models.Coordinates{X_from: 1.0, Y_from: 2.0, X_to: 3.0, Y_to: 4.0},
		},
		models.Order{
			Addres: models.Addres{
				From: models.From{StreetFrom: "куда нибудь хз", NumberFrom: "123", CityFrom: "Москва", CountryFrom: "Россия"},
				To:   models.To{StreetTo: "куда нибудь хз", NumberTo: "123", CityTo: "Москва", CountryTo: "Россия"},
			},
			Coordinates: models.Coordinates{X_from: 1.0, Y_from: 2.0, X_to: 3.0, Y_to: 4.0},
		},
	}
	for i := range testOrders {
		tdb.db.CreateOrder(int(source.ID), &testOrders[i])
	}
	t.Run("Получение всех заявок", func(t *testing.T) {
		ords, err := tdb.db.GetOrders()
		if err != nil {
			t.Errorf("Ошибка при получении заявок: %v", err)
		}
		if len(ords) != 2 {
			t.Errorf("Ожидалось 2 заявки, получено %d", len(ords))
		}
		//проверка айди заявок
		for i := range ords {
			if ords[i].Source_id != int(source.ID) {
				t.Errorf("Ожидался Source_id = %d, получено %d", source.ID, ords[i].Source_id)
			}
		}
	})
}

func TestDB_GetOrdersByID(t *testing.T) {
	tdb := SetUpTestDB(t)
	defer tdb.Cleanup(t)

	t.Run("Получение заявки по родному айди и айди источника", func(t *testing.T) {
		src := models.Sources{
			Title: "Источник",
		}
		tdb.db.CreateSources(&src)
		ord := models.Order{
			Addres: models.Addres{
				From: models.From{StreetFrom: "ул. Пушкина", NumberFrom: "123", CityFrom: "Москва", CountryFrom: "Россия"},
				To:   models.To{StreetTo: "ул. Дантеса", NumberTo: "123", CityTo: "Москва", CountryTo: "Россия"},
			},
			Coordinates: models.Coordinates{X_from: 1.0, Y_from: 2.0, X_to: 3.0, Y_to: 4.0},
		}

		tdb.db.CreateOrder(int(src.ID), &ord)

		ords, err := tdb.db.GetOrdersByid(int(ord.ID))
		if err != nil {
			t.Errorf("Ошибка при получении заявки по ID: %v", err)
		}
		if !reflect.DeepEqual(ords.ID, ord.ID) && !reflect.DeepEqual(ords.Addres, ord.Addres) {
			t.Errorf("Ожидалось %v, получено %v", ord.ID, ords.ID)
		}

		result, err := tdb.db.GetOrderBySource(int(src.ID))
		if err != nil {
			t.Errorf("Ошибка получения заявки по источнику: %v", err)
		}
		if !reflect.DeepEqual(result.ID, ord.ID) {
			t.Errorf("Ожидалось %d, получено %d", ords.ID, result.ID)
		}
	})
}
