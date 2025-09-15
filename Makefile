.PHONY: dev back front start-back start-front db-up db-down db-reset db-logs db-migrate db-psql

FRONT_DIR := organizer-front
BACK_DIR := organizer-back

# Run backend (Go) and frontend (Angular) in parallel
dev: db-up
	$(MAKE) -j 2 start-back start-front

# Backend only
back: db-up start-back

start-back:
	cd $(BACK_DIR) && PATH=$$PATH:/usr/local/go/bin go run .

# Frontend only
front: start-front

start-front:
	cd $(FRONT_DIR) && npx ng serve

# Database
db-up:
	sudo docker-compose up -d postgres

db-down:
	sudo docker-compose down

db-reset: db-down db-up
	@echo "Database has been reset"

db-logs:
	sudo docker-compose logs -f postgres

# Apply ALL .sql migrations inside organizer-back/migrations to the running container
db-migrate:
	@echo "Applying SQL migrations inside the container..."
	sudo docker exec -i organizer-postgres bash -lc 'set -e; for f in $$(ls -1 /docker-entrypoint-initdb.d/*.sql | sort); do echo "--> $$f"; psql -v ON_ERROR_STOP=1 -U $$POSTGRES_USER -d $$POSTGRES_DB -f "$$f"; done; echo "Migrations applied."'

# Open a psql session inside the container (useful for debugging)
db-psql:
	sudo docker exec -it organizer-postgres psql -U organizer -d organizer


