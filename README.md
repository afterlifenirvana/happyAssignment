# Happy Assignment

Organization chart application with drag-and-drop functionality to manage employee hierarchies.

## Setup and Running

### API (FastAPI)
```bash
cd api
uv sync
uv run fastapi dev main.py
```
API runs on http://localhost:8000

### UI (React + Vite)
```bash
cd ui/my-app
add .env with VITE_API_URL=http://localhost:8000
npm install
npm run dev
```
UI runs on http://localhost:8080

## Features
- Interactive organization chart
- Drag-and-drop to reassign managers
- Proximity-based edge connections
- Automatic hierarchy positioning