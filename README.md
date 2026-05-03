# Pazar SosyalFest Monorepo

Bu repo backend ve frontend ayri klasor yapisi ile duzenlenmistir.

## Klasorler

- `frontend/` : React + Vite istemci uygulamasi
- `backend/` : backend servis katmani (API, domain, is kurallari)

## Frontend Calistirma

```bash
cd frontend
npm ci
npm run build
npm run dev
```

## Frontend Uretim

```bash
cd frontend
docker compose -f docker-compose.prod.yml up -d --build
```

## Backend

Spring Boot API: [backend/README.md](backend/README.md). Varsayilan gelistirme: `cd backend && mvn spring-boot:run`.

## CI

GitHub Actions: [.github/workflows/ci.yml](.github/workflows/ci.yml) — backend `mvn test`, frontend `npm ci && npm run build`.
