package pkg

import (
	"encoding/json"
	"os"
	"regexp"
)

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
