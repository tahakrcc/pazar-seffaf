package com.pazarsaffaf.storage;

import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import java.io.InputStream;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.minio.enabled", havingValue = "true")
public class MinioEvidenceStorageService implements EvidenceStorageService {

    private final MinioClient minioClient;

    @Value("${app.minio.bucket}")
    private String bucket;

    @Override
    public String store(MultipartFile file, String prefix) throws Exception {
        String key = prefix + "/" + UUID.randomUUID() + "-" + file.getOriginalFilename();
        try (InputStream in = file.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder().bucket(bucket).object(key).stream(in, file.getSize(), -1).contentType(file.getContentType()).build());
        }
        return key;
    }
}
