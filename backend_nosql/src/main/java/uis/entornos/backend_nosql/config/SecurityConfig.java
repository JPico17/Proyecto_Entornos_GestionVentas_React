package uis.entornos.backend_nosql.config;

import uis.entornos.backend_nosql.filters.JwtTokenValidator;
import uis.entornos.backend_nosql.utils.JwtUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtUtils jwtUtils;

    public SecurityConfig(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // ❌ Desactivamos CSRF (no lo usamos en APIs REST)
                .csrf(csrf -> csrf.disable())
                // 🌍 Habilitamos CORS para todos (lo controlas en WebConfig)
                .cors(Customizer.withDefaults())
                // 🔒 Configuración de autorización
                .authorizeHttpRequests(auth -> auth
                        // Permitir preflight (OPTIONS)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Endpoints públicos
                        .requestMatchers("/api/login").permitAll()
                        // Permitir empleados temporalmente mientras pruebas
                        .requestMatchers(HttpMethod.GET, "/api/empleados").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/empleados").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/empleados/*").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/empleados/*").permitAll()
                        // Swagger (si lo estás usando)
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        // El resto requiere autenticación JWT
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll())
                // ✅ Agregamos el filtro JWT personalizado antes del de autenticación por
                // usuario/contraseña
                .addFilterBefore(new JwtTokenValidator(jwtUtils), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
