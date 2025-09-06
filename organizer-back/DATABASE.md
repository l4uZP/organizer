# Base de Datos - Organizer

## Configuración

### Variables de Entorno
```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=organizer
DB_PASSWORD=organizer123
DB_NAME=organizer
DB_SSLMODE=disable
JWT_SECRET=your-secret-key-change-in-production
```

### Comandos de Base de Datos

```bash
# Levantar base de datos
make db-up

# Bajar base de datos
make db-down

# Reiniciar base de datos
make db-reset

# Ver logs de la base de datos
make db-logs
```

## Estructura Actual

### Tabla: users
- `id` (SERIAL PRIMARY KEY)
- `nombres` (VARCHAR(100) NOT NULL)
- `apellidos` (VARCHAR(100) NOT NULL)
- `correo` (VARCHAR(255) UNIQUE NOT NULL)
- `usuario` (VARCHAR(50) UNIQUE NOT NULL)
- `contrasena` (VARCHAR(255) NOT NULL) - Hasheada con bcrypt
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Usuario por Defecto

Se crea automáticamente un usuario administrador:
- **Usuario**: admin
- **Contraseña**: password
- **Email**: admin@organizer.com

## Migraciones

Las migraciones se encuentran en `migrations/` y se ejecutan automáticamente al levantar el contenedor de PostgreSQL.

Para agregar nuevas tablas:
1. Crear archivo `migrations/XXX_nombre_migracion.sql`
2. Reiniciar la base de datos con `make db-reset`

## Portabilidad

### Backup
```bash
# Crear backup
docker exec organizer-postgres pg_dump -U organizer organizer > backup.sql

# Restaurar backup
docker exec -i organizer-postgres psql -U organizer organizer < backup.sql
```

### Migrar a producción
1. Exportar datos: `pg_dump -h localhost -U organizer organizer > production_backup.sql`
2. Importar en servidor: `psql -h production_host -U production_user production_db < production_backup.sql`
