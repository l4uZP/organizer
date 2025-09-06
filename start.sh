#!/bin/bash

# Script de inicio para Organizer
# Configura el PATH y ejecuta el proyecto

echo "🚀 Iniciando Organizer..."

# Agregar Go al PATH
export PATH=$PATH:/usr/local/go/bin

# Verificar que Go esté disponible
if ! command -v go &> /dev/null; then
    echo "❌ Error: Go no está instalado o no está en el PATH"
    echo "   Instala Go desde: https://golang.org/dl/"
    exit 1
fi

# Verificar que Docker esté disponible
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker no está instalado"
    echo "   Instala Docker desde: https://docs.docker.com/get-docker/"
    exit 1
fi

echo "✅ Dependencias verificadas"

# Levantar base de datos
echo "📦 Levantando base de datos PostgreSQL..."
sudo docker-compose up -d postgres

# Esperar a que la base de datos esté lista
echo "⏳ Esperando a que la base de datos esté lista..."
sleep 5

# Verificar que la base de datos esté funcionando
if ! sudo docker exec organizer-postgres pg_isready -U organizer -d organizer &> /dev/null; then
    echo "❌ Error: La base de datos no está respondiendo"
    exit 1
fi

echo "✅ Base de datos lista"

# Ejecutar el backend
echo "🔧 Iniciando backend..."
cd organizer-back
go run . &
BACKEND_PID=$!

# Esperar a que el backend esté listo
echo "⏳ Esperando a que el backend esté listo..."
sleep 3

# Verificar que el backend esté funcionando
if ! curl -s http://localhost:8080/api/v1/healthz &> /dev/null; then
    echo "❌ Error: El backend no está respondiendo"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Backend funcionando en http://localhost:8080"

# Ejecutar el frontend
echo "🎨 Iniciando frontend..."
cd ../organizer-front
npm start &
FRONTEND_PID=$!

echo "✅ Frontend iniciando en http://localhost:4200"
echo ""
echo "🎉 ¡Organizer está funcionando!"
echo "   - Backend: http://localhost:8080"
echo "   - Frontend: http://localhost:4200"
echo "   - Base de datos: localhost:5432"
echo ""
echo "Para detener: Ctrl+C"

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo "🛑 Deteniendo servicios..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    sudo docker-compose down
    echo "✅ Servicios detenidos"
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT

# Esperar a que el usuario presione Ctrl+C
wait
