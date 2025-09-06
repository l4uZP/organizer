#!/bin/bash

# Script de prueba para la API de Organizer
echo "🧪 Probando API de Organizer..."

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:8080/api/v1"

echo -e "${YELLOW}1. Probando health check...${NC}"
curl -s "$BASE_URL/healthz" | jq '.' || echo "❌ Error en health check"

echo -e "\n${YELLOW}2. Probando login con usuario admin...${NC}"
curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}' | jq '.' || echo "❌ Error en login"

echo -e "\n${YELLOW}3. Probando login con credenciales incorrectas...${NC}"
curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "wrong"}' | jq '.' || echo "❌ Error esperado en login"

echo -e "\n${YELLOW}4. Probando registro de nuevo usuario...${NC}"
curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "nombres": "Juan",
    "apellidos": "Pérez",
    "correo": "juan@example.com",
    "usuario": "juanperez",
    "contrasena": "password123"
  }' | jq '.' || echo "❌ Error en registro"

echo -e "\n${YELLOW}5. Probando login con el nuevo usuario...${NC}"
curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "juanperez", "password": "password123"}' | jq '.' || echo "❌ Error en login del nuevo usuario"

echo -e "\n${GREEN}✅ Pruebas completadas${NC}"
