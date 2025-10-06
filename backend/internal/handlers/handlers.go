package handlers

import "github.com/h1nigami/go-react-app/backend/internal/database"

var db database.DB = database.NewConnection("test.db")
