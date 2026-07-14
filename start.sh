#!/bin/bash
# EloCoach — Start both backend and frontend with one command
# Backend:  http://localhost:8000
# Frontend: http://localhost:5173

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║        EloCoach — Starting Up...             ║"
echo "╠══════════════════════════════════════════════╣"
echo "║  Backend  → http://localhost:8000            ║"
echo "║  Frontend → http://localhost:5173            ║"
echo "╠══════════════════════════════════════════════╣"
echo "║  Login credentials:                          ║"
echo "║  Admin:   admin@elocoach.gg / password       ║"
echo "║  Coach:   coach@elocoach.gg / password       ║"
echo "║  Student: student@elocoach.gg / password     ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# Start Laravel backend in background
echo "▶ Starting Laravel backend..."
cd "$ROOT/backend" && php artisan serve --port=8000 &
BACKEND_PID=$!

# Give backend a moment to boot
sleep 2

# Start Vite frontend in background
echo "▶ Starting React frontend..."
cd "$ROOT/frontend" && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers started!"
echo "   Press Ctrl+C to stop everything."
echo ""

# Wait and catch Ctrl+C to cleanly kill both
trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM

wait
