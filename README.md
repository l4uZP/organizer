# Organizer

Aplicación web de organización con backend en Go y frontend en Angular, incluyendo autenticación de usuarios y base de datos PostgreSQL.

### Ejecutar proyecto con Makefile

Requisitos mínimos:
- Go 1.23+
- Node.js 18+
- npm
- Docker
- Docker Compose

## Instalación

### 1. Instalar dependencias del frontend (solo primera vez):
```bash
cd organizer-front && npm ci
```

> **Nota:** `npm ci` es más rápido y determinista que `npm install`. Usa el `package-lock.json` para instalar exactamente las versiones especificadas.

### 2. Instalar dependencias del backend:
```bash
cd organizer-back && go mod tidy
```

### 3. Configurar base de datos:
```bash
# Levantar PostgreSQL con Docker
make db-up

# Verificar que la base de datos esté funcionando
make db-logs
```

## Desarrollo

### Levantar todo el proyecto:
```bash
make dev
```
Este comando levanta automáticamente la base de datos y luego el backend y frontend en paralelo.

### Servicios en desarrollo:
- **Frontend**: `http://localhost:4200` (Angular)
- **Backend**: `http://localhost:8080` (Go + Gin)
- **Base de datos**: `localhost:5432` (PostgreSQL)

### Comandos individuales:
```bash
# Solo backend (incluye base de datos)
make back

# Solo frontend
make front

# Solo base de datos
make db-up

# Ver logs de la base de datos
make db-logs

# Reiniciar base de datos
make db-reset
```

## Base de Datos

### Usuario por defecto:
- **Usuario**: `admin`
- **Contraseña**: `password`
- **Email**: `admin@organizer.com`

### Estructura actual:
- **Tabla `users`**: Almacena información de usuarios con autenticación
- **Campos**: id, nombres, apellidos, correo, usuario, contrasena (hasheada), timestamps

### API Endpoints:
- `GET /api/v1/healthz` - Health check
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/register` - Registrar nuevo usuario

### Ejemplo de uso de la API:
```bash
# Health check
curl http://localhost:8080/api/v1/healthz

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'

# Registrar usuario
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombres": "Juan",
    "apellidos": "Pérez", 
    "correo": "juan@example.com",
    "usuario": "juanperez",
    "contrasena": "password123"
  }'
```

## Inicio Rápido

Para iniciar todo el proyecto de una vez:
```bash
./start.sh
```

Este script:
- ✅ Verifica dependencias (Go, Docker)
- ✅ Levanta la base de datos PostgreSQL
- ✅ Inicia el backend en Go
- ✅ Inicia el frontend en Angular
- ✅ Maneja la limpieza al salir (Ctrl+C)

## Solución de problemas

### Error: "go: command not found"
```bash
# Agregar Go al PATH temporalmente
export PATH=$PATH:/usr/local/go/bin

# O agregar permanentemente al ~/.bashrc
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc
```

### Error: "Permission denied" con Docker
```bash
# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Reiniciar sesión o usar:
newgrp docker
```

### Error: "npm ERR! could not determine executable to run"

1. Si es la primera vez ejecutando el proyecto
```bash
make start-front
```
Espera y responde las preguntas de angular

2. Elimina las dependencias existentes:
   ```bash
   cd organizer-front
   rm -rf node_modules package-lock.json
   ```

3. Reinstala las dependencias:
   ```bash
   npm ci
   ```

4. Ejecuta el proyecto:
   ```bash
   make dev
   ```

## Portabilidad y Backup

### Backup de la base de datos:
```bash
# Crear backup completo
sudo docker exec organizer-postgres pg_dump -U organizer organizer > backup.sql

# Restaurar backup
sudo docker exec -i organizer-postgres psql -U organizer organizer < backup.sql
```

### Migrar a producción:
1. Exportar datos: `pg_dump -h localhost -U organizer organizer > production_backup.sql`
2. Importar en servidor: `psql -h production_host -U production_user production_db < production_backup.sql`

### Agregar nuevas tablas:
1. Crear archivo `organizer-back/migrations/XXX_nombre_migracion.sql`
2. Reiniciar la base de datos: `make db-reset`
3. Crear modelos Go correspondientes en `organizer-back/models/`
4. Agregar repositorios en `organizer-back/repository/`

## Estructura del Proyecto

```
organizer/
├── organizer-back/           # Backend en Go
│   ├── database/            # Configuración de BD
│   ├── models/              # Modelos de datos
│   ├── repository/          # Acceso a datos
│   ├── services/            # Lógica de negocio
│   ├── migrations/          # Scripts SQL
│   └── main.go             # Punto de entrada
├── organizer-front/         # Frontend en Angular
├── docker-compose.yml      # Configuración PostgreSQL
├── Makefile               # Comandos de desarrollo
└── README.md             # Este archivo
```
