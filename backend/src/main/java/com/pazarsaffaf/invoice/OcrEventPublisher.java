package com.pazarsaffaf.invoice;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class OcrEventPublisher {

    private final ObjectProvider<RabbitTemplate> rabbitTemplate;
    private final OcrProcessingService ocrProcessingService;

    @Value("${app.ocr.queue:pazar.ocr.jobs}")
    private String queue;

    @Value("${app.ocr.listener-enabled:false}")
    private boolean listenerEnabled;

    public void publishOrRunSync(Long ocrJobId) {
        RabbitTemplate rt = rabbitTemplate.getIfAvailable();
        if (rt != null && listenerEnabled) {
            rt.convertAndSend(queue, new OcrJobMessage(ocrJobId));
            log.debug("OCR job {} queued", ocrJobId);
        } else {
            ocrProcessingService.processJob(ocrJobId);
        }
    }
}
