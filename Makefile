.PHONY: dev back front start-back start-front db-up db-down db-reset db-logs db-migrate db-psql

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


# Aplica TODAS las migraciones .sql dentro de organizer-back/migrations al contenedor ya levantado
db-migrate:
	@echo "Aplicando migraciones SQL dentro del contenedor..."
	sudo docker exec -i organizer-postgres bash -lc 'set -e; for f in $$(ls -1 /docker-entrypoint-initdb.d/*.sql | sort); do echo "--> $$f"; psql -v ON_ERROR_STOP=1 -U $$POSTGRES_USER -d $$POSTGRES_DB -f "$$f"; done; echo "Migraciones aplicadas."'

# Abre una sesión psql dentro del contenedor (útil para debug)
db-psql:
	sudo docker exec -it organizer-postgres psql -U organizer -d organizer


