package config

import (
	"log"

	"gopkg.in/ini.v1"
)

var (
	Config *ini.File

	// PageSize RunMode string
	PageSize int
)

func init() {
	LoadInI()
	SetApp()
}

// LoadInI 载入配置
func LoadInI() {
	var err error
	Config, err = ini.Load("config/env.ini")
	// Config, err = ini.Load("env.ini")
	if err != nil {
		log.Fatalf("Fail to parse 'conf/env.ini': %v", err)
	}
}

func SetApp() {
	sec := Config.Section("app")
	PageSize = sec.Key("page_size").MustInt(10)
}
