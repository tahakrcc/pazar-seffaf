package com.pazarsaffaf.config;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.util.StringUtils;

/**
 * Render PostgreSQL {@code DATABASE_URL} değeri {@code postgresql://...} biçimindedir; Spring JDBC ise
 * {@code jdbc:postgresql://...} bekler. {@code render} profilinde bu dönüşümü ortam değişkeninden yapar.
 * Manuel JDBC kullanmak için {@code SPRING_DATASOURCE_URL=jdbc:postgresql://...} tanımlayın; bu durumda
 * dönüşüm atlanır.
 */
public final class RenderDatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String SOURCE = "renderDatabaseUrl";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        if (!isRenderProfile(environment)) {
            return;
        }
        String explicitJdbc = environment.getProperty("SPRING_DATASOURCE_URL");
        if (StringUtils.hasText(explicitJdbc) && explicitJdbc.startsWith("jdbc:")) {
            return;
        }
        String databaseUrl = environment.getProperty("DATABASE_URL");
        if (!StringUtils.hasText(databaseUrl)) {
            return;
        }
        String trimmed = databaseUrl.trim();
        if (!trimmed.startsWith("postgres://") && !trimmed.startsWith("postgresql://")) {
            return;
        }
        try {
            URI uri = URI.create(trimmed.replaceFirst("^postgres(ql)?://", "http://"));
            String userInfo = uri.getRawUserInfo();
            String user = null;
            String password = null;
            if (StringUtils.hasText(userInfo)) {
                int idx = userInfo.indexOf(':');
                if (idx >= 0) {
                    user = urlDecode(userInfo.substring(0, idx));
                    password = urlDecode(userInfo.substring(idx + 1));
                } else {
                    user = urlDecode(userInfo);
                }
            }
            String host = uri.getHost();
            if (host == null) {
                throw new IllegalArgumentException("DATABASE_URL host eksik");
            }
            int port = uri.getPort() > 0 ? uri.getPort() : 5432;
            String path = uri.getPath();
            if (path != null && path.startsWith("/")) {
                path = path.substring(1);
            }
            String query = uri.getRawQuery();
            StringBuilder jdbc = new StringBuilder();
            jdbc.append("jdbc:postgresql://").append(host).append(":").append(port).append("/");
            if (StringUtils.hasText(path)) {
                jdbc.append(path);
            }
            if (StringUtils.hasText(query)) {
                jdbc.append("?").append(query);
            } else if (!host.equals("localhost") && !host.startsWith("127.")) {
                jdbc.append("?sslmode=require");
            }
            Map<String, Object> map = new HashMap<>();
            map.put("spring.datasource.url", jdbc.toString());
            map.put("spring.datasource.driver-class-name", "org.postgresql.Driver");
            if (user != null) {
                map.put("spring.datasource.username", user);
            }
            if (password != null) {
                map.put("spring.datasource.password", password);
            }
            environment.getPropertySources().addFirst(new MapPropertySource(SOURCE, map));
        } catch (RuntimeException e) {
            throw new IllegalStateException(
                    "DATABASE_URL ayrıştırılamadı (render profili). SPRING_DATASOURCE_URL ile jdbc:postgresql://..."
                            + " kullanın.",
                    e);
        }
    }

    private static boolean isRenderProfile(ConfigurableEnvironment environment) {
        if (Arrays.asList(environment.getActiveProfiles()).contains("render")) {
            return true;
        }
        String raw = environment.getProperty("SPRING_PROFILES_ACTIVE");
        if (!StringUtils.hasText(raw)) {
            return false;
        }
        return Arrays.stream(raw.split(",")).map(String::trim).anyMatch("render"::equals);
    }

    private static String urlDecode(String s) {
        return URLDecoder.decode(s, StandardCharsets.UTF_8);
    }
}
