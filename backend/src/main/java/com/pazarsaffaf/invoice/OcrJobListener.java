package com.pazarsaffaf.invoice;

import com.pazarsaffaf.config.RabbitConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "app.ocr.listener-enabled", havingValue = "true")
public class OcrJobListener {

    private final OcrProcessingService ocrProcessingService;

    @RabbitListener(queues = "${app.ocr.queue:pazar.ocr.jobs}")
    public void onMessage(OcrJobMessage message) {
        log.info("OCR message received jobId={}", message.ocrJobId());
        ocrProcessingService.processJob(message.ocrJobId());
    }
}
