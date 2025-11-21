package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/h1nigami/go-react-app/backend/task/internal/config"
	"github.com/h1nigami/go-react-app/backend/task/internal/database"
	"github.com/h1nigami/go-react-app/backend/task/internal/handlers"
	"github.com/h1nigami/go-react-app/backend/task/pkg"
)

func main() {
	cfg := config.MustLoad()
	log := setUpLogger(cfg.Env)
	handlers.SetLogger(log)
	database.SetLoger(log)
	pkg.SetConfig(cfg)

	var storage database.SourcesStorage

	switch cfg.StorageType {
	case "sqlite":
		if err := database.InitSqliteDatabase(); err != nil {
			log.Error("Ошибка инициализации sqlite базы данных", slog.Any("error", err))
		}
		storage = database.DataBase
		log.Info("Используется sqlite база данных")
	case "postgresql":
		log.Error("постгрес еще не реализован")
	default:
		log.Error("не получилось задать тип базы данных")
	}

	handlers.SetStorage(storage)

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://127.0.0.1"},
		AllowMethods:     []string{"GET", "POST", "OPTIONS", "PUT", "DELETE", "PATCH"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	//Источники
	r.GET("/source", handlers.AllSources)
	r.GET("/source/:id", handlers.GetSourcesById)
	r.POST("/source", handlers.CreateSources)
	r.DELETE("/source/:id", handlers.DeleteSources)
	r.PATCH("/source/:id", handlers.UpdateSources)
	r.GET("/cities", handlers.Cities)
	r.GET("/geocode/:addres", handlers.GeoCode)
	//Заявки
	r.GET("/orders", handlers.AllOrders)
	r.GET("orders/:id", handlers.OrderById)
	r.POST("/orders/:id", handlers.CreateOrder)
	r.DELETE("/orders/:id", handlers.DeleteOrder)

	srv := &http.Server{
		Addr:         cfg.Addres,
		Handler:      r,
		ReadTimeout:  cfg.Timeout,
		WriteTimeout: cfg.Timeout,
		IdleTimeout:  cfg.IdleTimeout,
	}
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Error("ошибка при запуске сервера", slog.Any("error", err))
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Info("Вырубаем сервер")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Error("ошибка при закрытии сервера", slog.Any("error", err))
	}

	log.Info("Сервер вырублен")
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
