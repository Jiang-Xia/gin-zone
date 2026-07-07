.PHONY: deploy rollback rollback-list build

deploy:
	powershell -ExecutionPolicy Bypass -File deploy/pm2/deploy.ps1

rollback:
ifdef BACKUP
	powershell -ExecutionPolicy Bypass -File deploy/pm2/rollback.ps1 -BackupName $(BACKUP)
else
	powershell -ExecutionPolicy Bypass -File deploy/pm2/rollback.ps1
endif

rollback-list:
	powershell -ExecutionPolicy Bypass -File deploy/pm2/rollback.ps1 -List

build:
	set GOOS=linux&& set GOARCH=amd64&& set CGO_ENABLED=0&& go build -ldflags="-s -w" -o zone-server .
