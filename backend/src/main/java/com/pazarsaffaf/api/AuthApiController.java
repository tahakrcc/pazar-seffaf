package com.pazarsaffaf.api;

import com.pazarsaffaf.config.JwtService;
import com.pazarsaffaf.iam.AppUser;
import com.pazarsaffaf.iam.AppUserRepository;
import com.pazarsaffaf.iam.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthApiController {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public record LoginRequest(@Email String email, @NotBlank String password, String role) {}

    public record LoginResponse(String token, Map<String, Object> user) {}

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest req) {
        AppUser user =
                appUserRepository
                        .findByEmailIgnoreCase(req.email())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Gecersiz giris"));
        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Gecersiz giris");
        }
        UserRole expected = mapUiRole(req.role());
        if (expected != null && user.getRole() != expected) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Rol uyusmuyor");
        }
        Long muniId = user.getMunicipality() != null ? user.getMunicipality().getId() : null;
        String token = jwtService.createToken(user.getEmail(), user.getId(), user.getRole(), muniId);
        return new LoginResponse(
                token,
                Map.of(
                        "id",
                        user.getId(),
                        "email",
                        user.getEmail(),
                        "name",
                        user.getName(),
                        "role",
                        toUiRole(user.getRole()),
                        "roleCode",
                        user.getRole().name()));
    }

    private static UserRole mapUiRole(String ui) {
        if (ui == null || ui.isBlank()) {
            return null;
        }
        return switch (ui) {
            case "Yönetici", "Yonetici" -> UserRole.ADMIN;
            case "Esnaf" -> UserRole.VENDOR;
            case "Zabıta", "Zabita" -> UserRole.OFFICER;
            case "Zabıta Müdürü", "Zabita Muduru" -> UserRole.CHIEF;
            default -> null;
        };
    }

    private static String toUiRole(UserRole r) {
        return switch (r) {
            case ADMIN -> "Yönetici";
            case VENDOR -> "Esnaf";
            case OFFICER -> "Zabıta";
            case CHIEF -> "Zabıta Müdürü";
        };
    }
}
