#!/bin/bash

# Organizer start script
# Configures PATH and runs the project

echo "🚀 Starting Organizer..."

# Add Go to PATH
export PATH=$PATH:/usr/local/go/bin

# Ensure Go is available
if ! command -v go &> /dev/null; then
    echo "❌ Error: Go is not installed or not in PATH"
    echo "   Install Go from: https://golang.org/dl/"
    exit 1
fi

# Ensure Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed"
    echo "   Install Docker from: https://docs.docker.com/get-docker/"
    exit 1
fi

echo "✅ Dependencies verified"

# Bring up database
echo "📦 Starting PostgreSQL database..."
sudo docker-compose up -d postgres

# Wait for database readiness
echo "⏳ Waiting for the database to be ready..."
sleep 5

# Check database is responding
if ! sudo docker exec organizer-postgres pg_isready -U organizer -d organizer &> /dev/null; then
    echo "❌ Error: Database is not responding"
    exit 1
fi

echo "✅ Database ready"

# Start backend
echo "🔧 Starting backend..."
cd organizer-back
go run . &
BACKEND_PID=$!

# Wait a moment for backend
echo "⏳ Waiting for backend to be ready..."
sleep 3

# Health check
if ! curl -s http://localhost:8080/api/v1/healthz &> /dev/null; then
    echo "❌ Error: Backend is not responding"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Backend running at http://localhost:8080"

# Start frontend
echo "🎨 Starting frontend..."
cd ../organizer-front
npm start &
FRONTEND_PID=$!

echo "✅ Frontend starting at http://localhost:4200"
echo ""
echo "🎉 Organizer is up!"
echo "   - Backend: http://localhost:8080"
echo "   - Frontend: http://localhost:4200"
echo "   - Database: localhost:5432"
echo ""
echo "Press Ctrl+C to stop"

# Cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    sudo docker-compose down
    echo "✅ Services stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Wait for Ctrl+C
wait
