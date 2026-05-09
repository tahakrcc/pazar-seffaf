# Render / Docker: Spring Boot API (Java 17)
# Web Service → Language: Docker, Root Directory: backend

FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /src
COPY pom.xml .
COPY src ./src
RUN mvn -B -q clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
COPY --from=build /src/target/pazar-api-0.1.0-SNAPSHOT.jar app.jar
USER spring:spring
EXPOSE 8080
# Render PORT ortam değişkenini dinle
ENTRYPOINT ["sh", "-c", "exec java -jar -Dserver.port=${PORT:-8080} app.jar"]
