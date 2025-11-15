package pkg

import "regexp"

func PhoneNumberValidator(phone string) bool {
	re := regexp.MustCompile(`/^(\+7|7|8)\d{10}$`)
	return re.MatchString(phone)
}
