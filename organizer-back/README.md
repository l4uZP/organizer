# Organizer Back (Go)

Backend mínimo en Go (Gin) para autenticar contra el frontend Angular.

## Requisitos
- Go >= 1.23 (se recomienda toolchain 1.24+)
- Linux/macOS/Windows

Verifica tu versión:
```bash
go version
```

## Instalar dependencias
```bash
go mod tidy
```

## Ejecutar en desarrollo
Arranca el servidor en `http://localhost:8080`:
```bash
go run .
```

El CORS ya permite el origen `http://localhost:4200` del Angular CLI.

## Endpoints
- Salud del servicio
  - `GET /api/v1/healthz`

- Login (por ahora hardcoded)
  - `POST /api/v1/auth/login`
  - Body JSON:
    ```json
    { "username": "admin", "password": "admin", "remember": true }
    ```
  - Respuesta 200:
    ```json
    { "token": "dummy-token", "user": "admin" }
    ```

Ejemplo con curl:
```bash
curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin","remember":true}' | jq .
```

## Compilar binario
```bash
go build -o organizer-back
./organizer-back
```

## Notas
- Aún no se conecta a PostgreSQL. Se añadirá `pgx` y migraciones más adelante.
- Configuración de CORS y rutas en `main.go`.

## Estructura
- `main.go`: servidor Gin, CORS y rutas `/api/v1`.
- `go.mod`: módulo y dependencias.

## Problemas comunes
- Error por versión de Go: actualiza a 1.23+ (ideal 1.24.x) o usa `asdf`, `gvm` o el instalador oficial.
