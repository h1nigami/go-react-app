package pkg

import "regexp"

func PhoneNumberValidator(phone string) bool {
	cleanedPhone := regexp.MustCompile(`\D`).ReplaceAllString(phone, "")
	re := regexp.MustCompile(`^(\+7|7|8)?\d{10}$`)
	return re.MatchString(cleanedPhone)
}
