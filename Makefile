.PHONY: dev back front start-back start-front

FRONT_DIR := organizer-front
BACK_DIR := organizer-back

# Ejecuta backend (Go) y frontend (Angular) en paralelo
dev:
	$(MAKE) -j 2 start-back start-front

# Solo backend
back: start-back

start-back:
	cd $(BACK_DIR) && go run .

# Solo frontend
front: start-front

start-front:
	cd $(FRONT_DIR) && npx ng serve


