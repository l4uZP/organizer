.PHONY: dev back front start-back start-front db-up db-down db-reset db-logs

FRONT_DIR := organizer-front
BACK_DIR := organizer-back

# Ejecuta backend (Go) y frontend (Angular) en paralelo
dev: db-up
	$(MAKE) -j 2 start-back start-front

# Solo backend
back: db-up start-back

start-back:
	cd $(BACK_DIR) && PATH=$$PATH:/usr/local/go/bin go run .

# Solo frontend
front: start-front

start-front:
	cd $(FRONT_DIR) && npx ng serve

# Base de datos
db-up:
	sudo docker-compose up -d postgres

db-down:
	sudo docker-compose down

db-reset: db-down db-up
	@echo "Base de datos reiniciada"

db-logs:
	sudo docker-compose logs -f postgres


