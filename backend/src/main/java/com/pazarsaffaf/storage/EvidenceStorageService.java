package com.pazarsaffaf.storage;

import org.springframework.web.multipart.MultipartFile;

public interface EvidenceStorageService {

    String store(MultipartFile file, String prefix) throws Exception;
}
