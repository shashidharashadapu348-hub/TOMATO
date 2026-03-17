# Tomato Full Stack (Node.js)

This project now includes a complete Node.js backend for your Tomato frontend.

## Features

- Express API backend
- JSON file-backed persistence (users, contacts, carts, orders)
- JWT authentication (register/login)
- Frontend form + cart synchronization with backend APIs
- GitHub Actions CI workflow

## Project Structure

- `Tomato .html`, `Tomato.css`, `Tomato.js`: Frontend
- `server.js`, `src/`: Backend
- `data/tomato-store.json`: app data store (created automatically)
- `.github/workflows/node-ci.yml`: GitHub CI pipeline

## Setup

1. Copy env template:
   - `copy .env.example .env` (Windows)
2. Update `.env` values:
   - `JWT_SECRET` (required)
3. Install dependencies:
   - `npm install`
4. Initialize data store:
   - `npm run db:migrate`
5. Start server:
   - `npm run dev`

Open: `http://localhost:3000`

## API Endpoints

- `GET /api/health`
- `GET /api/menu?q=...`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/cart/sync`
- `GET /api/cart/:cartId`
- `POST /api/contact`
- `POST /api/orders`

## Notes

- Existing frontend cart still works locally and now syncs with backend.
- If backend is unreachable, frontend gracefully keeps local behavior.
- This backend avoids native database build issues on Windows and Node 24.
