package models

type Task struct {
	ID       int    `json:"id"`
	Title    string `json:"title"`
	Is_Done  bool   `json:"done"`
	Priority int    `json:"priority"`
}
