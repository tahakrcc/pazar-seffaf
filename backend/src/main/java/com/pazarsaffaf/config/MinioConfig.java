package com.pazarsaffaf.config;

import io.minio.MinioClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MinioConfig {

    @Bean
    @ConditionalOnProperty(name = "app.minio.enabled", havingValue = "true")
    MinioClient minioClient(
            @Value("${app.minio.endpoint}") String endpoint,
            @Value("${app.minio.access-key}") String access,
            @Value("${app.minio.secret-key}") String secret) {
        return MinioClient.builder().endpoint(endpoint).credentials(access, secret).build();
    }
}
