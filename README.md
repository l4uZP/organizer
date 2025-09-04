# Organizer

### Ejecutar proyecto con Makefile

Requisitos mínimos:
- Go 1.23+
- Node.js 18+ y npm

Instalación de dependencias (solo primera vez):
```bash
cd organizer-front && npm ci
```

Levantar backend (Go) y frontend (Angular) en paralelo:
```bash
make dev
```

Servicios en desarrollo:
- Frontend: `http://localhost:4200` (Angular `ng serve` vía `npx`)
- Backend: `http://localhost:8080`

Comandos individuales:
```bash
# Solo backend
make back

# Solo frontend
make front
```
