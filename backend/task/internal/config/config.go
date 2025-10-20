package config

import (
	"log"
	"os"
	"time"

	"github.com/ilyakaznacheev/cleanenv"
	"github.com/joho/godotenv"
)

type Config struct {
	Env         string `yaml:"env" env-default:"local"`
	StoragePath string `yaml:"storage_path" env-required:"true"`
	HttpServer  `yaml:"http_server"`
}

type HttpServer struct {
	Addres      string        `yaml:"addres" env-required:"true"`
	Timeout     time.Duration `yaml:"timeout" env-default:"4s"`
	IdleTimeout time.Duration `yaml:"idle_timeout" env-defaulg:"60s"`
}

func MustLoad() *Config {
	if err := godotenv.Load(".env"); err != nil {
		log.Fatalf("error: ", err)
	}
	CONFIG_PATH := os.Getenv("CONFIG_PATH")
	if CONFIG_PATH == "" {
		log.Fatal("путь до конфига не задан")
	}

	if _, err := os.Stat(CONFIG_PATH); os.IsNotExist(err) {
		log.Fatalf("config file %s is not exist", CONFIG_PATH)
	}

	var cfg Config

	if err := cleanenv.ReadConfig(CONFIG_PATH, &cfg); err != nil {
		log.Fatalf("не удалось прочитать конфиг: %s", err)
	}

	return &cfg
}
