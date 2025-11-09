package main

import (
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/h1nigami/go-react-app/backend/auth/internal/config"
	"github.com/h1nigami/go-react-app/backend/auth/internal/handlers"
)

func main() {
	cfg := config.MustLoad()
	log := SetUpLogger(cfg.Env)
	handlers.SetLoger(log)
	fmt.Println(cfg)
	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://127.0.0.1"},
		AllowMethods:     []string{"GET", "POST", "OPTIONS", "PUT", "DELETE", "PATCH"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	r.POST("/register", handlers.AuthHandler)
	r.POST("/login", handlers.LoginHandler)
	r.GET("/verify", handlers.AuthMiddleware(), handlers.VerifyHandler)
	r.GET("/logout", handlers.AuthMiddleware(), handlers.LogOutHandler)
	srv := &http.Server{
		Addr:         cfg.Addres,
		Handler:      r,
		ReadTimeout:  cfg.Timeout,
		WriteTimeout: cfg.Timeout,
		IdleTimeout:  cfg.IdleTimeout,
	}

	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Error("ListenAndserve()", slog.String("error", err.Error()))
	}
}

const (
	envLocal = "local"
	envDev   = "dev"
	envProd  = "prod"
)

func SetUpLogger(env string) *slog.Logger {
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
