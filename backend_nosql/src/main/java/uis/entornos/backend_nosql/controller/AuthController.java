package uis.entornos.backend_nosql.controller;

import uis.entornos.backend_nosql.dto.LoginRequest;
import uis.entornos.backend_nosql.model.Empleado;
import uis.entornos.backend_nosql.repository.EmpleadoRepository;
import uis.entornos.backend_nosql.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            String identificador = request.getIdentificador();
            String password = request.getPassword();

            // 🔄 Buscamos por email o usuario en MongoDB
            Optional<Empleado> empleadoOpt = empleadoRepository.findByEmailAndPassword(identificador, password);

            if (empleadoOpt.isEmpty()) {
                empleadoOpt = empleadoRepository.findByUsuarioAndPassword(identificador, password);
            }

            if (empleadoOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("mensaje", "❌ Credenciales inválidas"));
            }

            Empleado empleado = empleadoOpt.get();
            String sucursalId = (empleado.getSucursal() != null) ? empleado.getSucursal().getId() : null;

            // ✅ Generar el token JWT
            String subject = empleado.getUsuario() != null ? empleado.getUsuario() : empleado.getEmail();
            String token = jwtUtils.generateToken(subject);

            // ✅ Construir respuesta
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("id", empleado.getId());
            response.put("nombre", empleado.getNombre());
            response.put("usuario", empleado.getUsuario());
            response.put("email", empleado.getEmail());
            response.put("role", empleado.getRole() != null ? empleado.getRole().toString() : "EMPLOYEE");
            response.put("sucursalId", sucursalId);
            response.put("mensaje", "✅ Login exitoso");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error interno: " + e.getMessage()));
        }
    }
}
