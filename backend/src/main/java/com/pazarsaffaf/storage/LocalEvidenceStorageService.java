package com.pazarsaffaf.storage;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
@ConditionalOnProperty(name = "app.minio.enabled", havingValue = "false", matchIfMissing = true)
public class LocalEvidenceStorageService implements EvidenceStorageService {

    private final Path root;

    public LocalEvidenceStorageService(@Value("${app.storage.local-dir:./storage}") String dir) {
        this.root = Path.of(dir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(root);
        } catch (Exception e) {
            throw new IllegalStateException("Cannot create storage dir", e);
        }
    }

    @Override
    public String store(MultipartFile file, String prefix) throws Exception {
        String name = prefix + "/" + UUID.randomUUID() + "-" + file.getOriginalFilename();
        Path target = root.resolve(name);
        Files.createDirectories(target.getParent());
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        }
        return "local://" + name;
    }
}
