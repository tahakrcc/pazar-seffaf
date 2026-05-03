# Pazar API (Spring Boot)

Moduler monolit: pazar katalogu, fiyat (satıcı teklifleri), alışveriş optimizasyonu, şikayet (kanıt yukleme), denetim, OCR (kuyruk veya senkron), JWT kimlik.

## Gereksinimler

- JDK 17+
- Maven 3.9+
- Yerel gelistirme varsayilan olarak **H2** bellek veritabani + Flyway kullanir (`application.yml`).

## Calistirma

```bash
cd backend
mvn spring-boot:run
```

API: `http://localhost:8080`  
Swagger UI: `http://localhost:8080/api/v1/docs/swagger-ui`

## PostgreSQL + Redis + RabbitMQ + MinIO (Docker)

```bash
docker compose -f deploy/docker-compose.yml up -d
```

Sonra:

```bash
set DATABASE_URL=jdbc:postgresql://localhost:5432/pazar
set DATABASE_USER=pazar
set DATABASE_PASSWORD=pazar
set DATABASE_DRIVER=org.postgresql.Driver
set JPA_DIALECT=org.hibernate.dialect.PostgreSQLDialect
set RABBITMQ_ENABLED=true
set OCR_LISTENER_ENABLED=true
set MINIO_ENABLED=true
mvn spring-boot:run
```

(Linux/macOS icin `export` kullanin.)

## Onemli uçlar

- `POST /api/v1/auth/login`
- `GET /api/v1/markets`, `GET /api/v1/markets/{id}`, `GET /api/v1/markets/{id}/prices`, `GET /api/v1/markets/{id}/map-schema`
- `GET /api/v1/products`
- `POST /api/v1/shopping/optimize`, `POST /api/v1/ai/optimize-budget`
- `POST /api/v1/complaints` (multipart: `marketId`, `description`, `latitude`, `longitude`, `photo`)
- `GET/POST /api/v1/officer/*`, `GET/POST /api/v1/chief/*`, `POST /api/v1/admin/*`, `GET/POST /api/v1/vendor/*`

## Frontend

`frontend` Vite proxy ile `/api` -> `8080`. `npm run dev` ile calistirin.

## Guvenlik

Uretimde `JWT_SECRET` degistirin; KVKK icin delil saklama ve imha politikalarini isletin.
