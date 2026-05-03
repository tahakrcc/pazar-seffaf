package com.pazarsaffaf;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class PazarSaffafApplication {

    public static void main(String[] args) {
        SpringApplication.run(PazarSaffafApplication.class, args);
    }
}
