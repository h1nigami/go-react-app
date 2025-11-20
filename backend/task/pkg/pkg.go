package pkg

import (
	"context"
	"encoding/json"
	"os"
	"regexp"

	dadata "github.com/ekomobile/dadata/v2"
	"github.com/ekomobile/dadata/v2/api/model"
	"github.com/h1nigami/go-react-app/backend/task/internal/config"
)

var cfg *config.Config

func SetConfig(c *config.Config) {
	cfg = c
}

func PhoneNumberValidator(phone string) bool {
	cleanedPhone := regexp.MustCompile(`\D`).ReplaceAllString(phone, "")
	re := regexp.MustCompile(`^(\+7|7|8)?\d{10}$`)
	return re.MatchString(cleanedPhone)
}

func ParseCity(cityName string) map[string]any {
	data, err := os.ReadFile("cities.json")
	if err != nil {
		return nil
	}

	var cities []map[string]any
	if err := json.Unmarshal(data, &cities); err != nil {
		return nil
	}

	// Поиск города по имени
	for _, city := range cities {
		if name, ok := city["name"].(string); ok {
			if name == cityName {
				return city
			}
		}
	}

	return nil // Город не найден
}

func GetAllCities() []map[string]any {
	data, err := os.ReadFile("cities.json")
	if err != nil {
		return nil
	}
	var cities []map[string]any
	if err := json.Unmarshal(data, &cities); err != nil {
		return nil
	}
	return cities
}

func GeoCoder(query string) ([]*model.Address, error) {
	qeryBytes := []byte(query)
	for i := 0; i < len(qeryBytes); i++ {
		if qeryBytes[i] == byte('.') {
			qeryBytes[i] = byte('/')
		}
	}
	api := dadata.NewCleanApi()
	result, err := api.Address(context.Background(), string(qeryBytes))

	if err != nil {
		return nil, err
	}
	return result, nil
}
