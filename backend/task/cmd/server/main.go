package main

import (
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/h1nigami/go-react-app/backend/task/internal/config"
	"github.com/h1nigami/go-react-app/backend/task/internal/database"
	"github.com/h1nigami/go-react-app/backend/task/internal/handlers"
)

func main() {
	cfg := config.MustLoad()
	log := setUpLogger(cfg.Env)
	var storage database.TaskStorage

	switch cfg.StorageType {
	case "sqlite":
		err := database.InitSqliteDatabase()
		if err != nil {
			log.Error("Ошибка инициализации sqlite базы данных", slog.Any("error", err))
		}
		storage = database.DataBase
		log.Info("Используется sqlite база данных")
	default:
		log.Error("не получилось задать тип базы данных")
	}

	handlers.SetStorage(storage)

	log.Info("микросервис для таск стартует", slog.String("env", cfg.Env), slog.String("addr", cfg.Addres), slog.Any("storage_path", cfg.StoragePath))

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://127.0.0.1"},
		AllowMethods:     []string{"GET", "POST", "OPTIONS", "PUT", "DELETE", "PATCH"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	r.GET("/task", handlers.AllTask)
	r.GET("/task/:id", handlers.GetTaskById)
	r.POST("/task", handlers.CreateTask)
	r.DELETE("/task/:id", handlers.DeleteTask)
	r.PATCH("task/:id", handlers.Updatetask)
	srv := &http.Server{
		Addr:         cfg.Addres,
		Handler:      r,
		ReadTimeout:  cfg.Timeout,
		WriteTimeout: cfg.Timeout,
		IdleTimeout:  cfg.IdleTimeout,
	}

	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Error("ошибка при запуске сервера", slog.Any("error", err))
	}

}

const (
	envLocal = "local"
	envDev   = "dev"
	envProd  = "prod"
)

func setUpLogger(env string) *slog.Logger {
	var log *slog.Logger

	switch env {
	case envLocal:
		log = slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelDebug}))

	case envDev:
		log = slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelDebug}))

	case envProd:
		log = slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
	}

	return log
}
