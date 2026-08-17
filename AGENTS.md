# AGENTS.md

## Architecture

Three independent packages in one repo, no shared build orchestration:

| Package | Path | Stack | Angular Version | Purpose |
|---------|------|-------|-----------------|---------|
| `backend/` | `/backend` | Laravel 12 / PHP 8.2+ | — | REST API (Sanctum auth) |
| `web/` | `/web` | Angular 21, SSR (Node/Express), Vitest | 21 | Admin portal (web browsers) |
| `mobile/` | `/mobile` | Ionic 8 / Angular 20, Capacitor, Karma/Jasmine | 20 | End-user mobile app |

**Critical: `web/` and `mobile/` run on different Angular major versions. Do not cross-pollinate imports or tooling between them.**

## Quick Commands

### Backend (`backend/`)
```bash
composer install                  # install PHP deps
php artisan serve                 # API server at http://127.0.0.1:8000
php artisan test                  # PHPUnit (in-memory SQLite, no .env needed)
php artisan migrate               # run migrations
composer setup                    # full init: install + .env + key:generate + migrate + npm build
```

### Web (`web/`)
```bash
npm install
npm run dev           # ng serve (SSR dev, http://localhost:4200)
npm run build         # production SSR build -> dist/Astrology/
npm run test          # Vitest unit tests
```

### Mobile (`mobile/`)
```bash
npm install
npm run start         # ng serve (Ionic dev server)
npm run build         # ng build -> www/
npm run test          # Karma/Jasmine
npm run lint          # Angular ESLint
```

## Auth & Role System

- **Sanctum** token-based auth on all protected routes.
- Two hardcoded roles: `admin` and `user` (stored in `users.role` column).
- **Web portal (`web/`)**: Only `admin` role can log in. `user` role is rejected with 403.
- **Mobile app (`mobile/`)**: Only `user` role can log in. `admin` role is rejected with 403.
- Login endpoints are separate: `POST /api/auth/web-login` (admin) vs `POST /api/auth/mobile-login` (user).
- Admin routes are guarded by `CheckRole` middleware at `backend/app/Http/Middleware/CheckRole.php`.

## API Details

- All API requests from both frontend apps go to `http://127.0.0.1:8000/api` (hardcoded in `auth.service.ts` in both apps).
- Routes defined in `backend/routes/api.php` — three groups: public, `auth:sanctum` user, `auth:sanctum + CheckRole:admin`.
- Payment integration uses **Razorpay** (credentials in `backend/.env`: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`).

## Database

- Default local DB: **SQLite** (`backend/database/database.sqlite`).
- PHPUnit tests use **in-memory SQLite** (`:memory:`) — no real DB needed to run tests.
- Migrations: `backend/database/migrations/` — key custom tables: `astrology_tables`, `lms_and_rbac_tables`, `jathagam_profile_notification_tables`.

## Web App SSR

- All routes are **pre-rendered** (Prerender mode) — see `web/src/app/app.routes.server.ts`.
- The `adminGuard` returns `true` during SSR (`typeof window === 'undefined'`) to allow hydration, then checks auth client-side.
- SSR server entry: `web/src/server.ts` (Express on port 4000 in production).
- Build output: `web/dist/Astrology/` with `server/` and `browser/` subdirectories.

## Mobile App Structure

- Uses **NgModule** pattern (not standalone) — new pages must be declared in `app.module.ts`.
- Exception: Jathagam sub-components and Profile are standalone but imported into `AppModule`.
- Routing uses `PreloadAllModules` strategy.
- SCSS for styles, component files: `*.page.ts`, `*.component.ts`.
- Capacitor for native features — Android platform at `mobile/android/` (gitignored).

## Code Style & Conventions

- **Web (`web/`)**: All CSS is inlined in `@Component` `styles` arrays (no external `.css` files per component). Prettier configured in `web/package.json` (100 print width, single quotes, Angular HTML parser).
- **Mobile (`mobile/`)**: Uses SCSS, external style files. ESLint with Angular rules.
- **Backend (`backend/`)**: Standard Laravel conventions. Tailwind CSS v4 via Vite. No custom PHP linting configured.
- Tamil language is used in user-facing messages (API responses, mobile UI).

## Testing

- **Backend**: `php artisan test` — only skeleton `ExampleTest.php` exists. No feature tests yet.
- **Web**: `ng test` (Vitest) — only `app.spec.ts` exists. SSR-aware: tests run in jsdom.
- **Mobile**: `ng test` (Karma/Jasmine). Has `ng lint` (Angular ESLint).
- **No CI/CD pipelines** — no `.github/workflows/` or similar config exists.

## Gotchas

- The `web/` app catches all unknown routes and redirects to `/login` (`path: '**'`).
- The backend `composer setup` script runs `npm install` + `npm run build` at the root level — this assumes the root `package-lock.json` is valid. Check before running.
- `web/` Prettier overrides HTML files to use Angular parser — formatting HTML outside this config will break templates.
- Mobile environment files at `mobile/src/environments/` handle prod vs dev API URLs (currently hardcoded to localhost).
- The `.gitignore` ignores `.env` files except `.env.example` — never commit `backend/.env`.
- Root `package-lock.json` exists at repo root but there's no root `package.json` — it likely belongs to one of the sub-packages.
