# Tomato — Food Delivery Full Stack App
**Node.js + Express**

Tomato is a web-based food delivery application that lets users browse menus, manage a shopping cart, place orders, and contact support. The app provides an interactive storefront with category browsing, featured items, cart checkout, user authentication, and a contact form. It ships as a vanilla HTML/CSS/JavaScript frontend served by a Node.js + Express API with JSON file-backed persistence.

## Features

- **Food Menu**: Browse categories, featured dishes, and search the full menu with prices and descriptions.
- **Shopping Cart**: Add items, adjust quantities, apply promo codes, and proceed to checkout.
- **User Auth**: Register and log in with JWT-based authentication (bcrypt password hashing).
- **Order & Contact APIs**: Submit delivery orders and contact messages stored on the backend.
- **Cart Sync**: Frontend cart syncs with backend APIs while gracefully falling back to local storage if offline.
- **JSON Data Store**: Lightweight persistence via `data/tomato-store.json` — no native database build required.
- **CI Pipeline**: GitHub Actions workflow runs install, migration, and health-check smoke tests.

## Quick Start

### Prerequisites

- Node.js 18+ and npm installed

### Install

```bash
git clone https://github.com/shashidharashadapu348-hub/TOMATO.git
cd TOMATO
npm install
```

### Run (development)

```bash
copy .env.example .env
npm run db:migrate
npm run dev
# open http://localhost:3000/
```

### Run (production)

```bash
npm start
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Service health check |
| `GET` | `/api/menu?q=...` | Menu items (optional search) |
| `POST` | `/api/auth/register` | Create a new user account |
| `POST` | `/api/auth/login` | Log in and receive a JWT |
| `POST` | `/api/cart/sync` | Sync cart state with the server |
| `GET` | `/api/cart/:cartId` | Retrieve a saved cart |
| `POST` | `/api/contact` | Submit a contact message |
| `POST` | `/api/orders` | Place a delivery order |

## Environment Variables

Create a `.env` file at the project root. Required variables:

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: `3000`) |
| `JWT_SECRET` | Secret key for signing JWT tokens (required) |

Do not commit secrets to source control. Copy `.env.example` and replace values locally.

## Project Structure (high level)

- `Tomato .html`, `Tomato.css`, `Tomato.js` — Frontend storefront, styles, and client logic.
- `images/` — Food category and menu item images.
- `server.js` — Application entry point; starts the Express server.
- `src/app.js` — Express app configuration, middleware, and static file serving.
- `src/routes/` — API route handlers (auth, cart, menu, contact, orders).
- `src/middleware/` — JWT auth and error-handling middleware.
- `src/db/` — JSON file database helpers and migration script.
- `src/config/` — Environment and menu data configuration.
- `data/` — Runtime data store (`tomato-store.json`, created on first run).
- `.github/workflows/` — GitHub Actions CI pipeline.

## Deployment

Tomato runs as a Node.js server and can be deployed to any platform that supports Node (Railway, Render, Fly.io, VPS, etc.).

- **Start command:** `npm start`
- **Port:** Set `PORT` via environment variable (platforms like Render/Railway inject this automatically).
- **Secrets:** Set `JWT_SECRET` in your host's environment settings.

Tip: Run `curl http://localhost:3000/api/health` after deploy to verify the API is live.

## Contributing

1. Fork or branch from `main`.
2. Create a feature branch: `git checkout -b feat/your-feature`.
3. Make changes and run `npm run db:migrate` + `npm start` to verify locally.
4. Commit and push, then open a Pull Request.

### Commit example

```bash
git add .
git commit -m "feat: add short description"
git push origin HEAD
```

## Troubleshooting

- If `npm run dev` fails on Windows PowerShell due to execution policy, use `npm.cmd run dev` or run the project in a Node-enabled shell.
- If a dependency is missing, run `npm install` to install packages.
- If port 3000 is already in use, change `PORT` in `.env` or stop the other process using that port.
- Check browser devtools (F12) → Console/Network for runtime errors.
- If the backend is unreachable, the frontend keeps local cart behavior as a fallback.

## License

This repository does not include a license file by default. Suggested: MIT. Add a `LICENSE` file with your preferred license.

## Contact

- **Maintainer:** shashidharashadapu348@gmail.com
- **Repository:** https://github.com/shashidharashadapu348-hub/TOMATO
