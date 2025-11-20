package uis.entornos.backend_nosql.controller;

import uis.entornos.backend_nosql.dto.VentaDTO;
import uis.entornos.backend_nosql.model.Venta;
import uis.entornos.backend_nosql.service.VentaService;
import uis.entornos.backend_nosql.repository.VentaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "*")
public class VentaController {

    private final VentaService ventaService;
    private final VentaRepository ventaRepository;

    public VentaController(VentaService ventaService, VentaRepository ventaRepository) {
        this.ventaService = ventaService;
        this.ventaRepository = ventaRepository;
    }

    @GetMapping
    public List<Venta> listarVentas() {
        return ventaService.listarTodas();
    }

    @PostMapping
    public ResponseEntity<?> registrarVenta(@RequestBody VentaDTO dto) {
        System.out.println("CLIENTE ID: " + dto.getClienteId());
        System.out.println("EMPLEADO ID: " + dto.getEmpleadoId());
        System.out.println("SUCURSAL ID: " + dto.getSucursalId());
        dto.getItems().forEach(i -> 
        System.out.println("PRODUCTO ID: " + i.getProductoId())
    );
        try {
            Venta nueva = ventaService.registrarVenta(dto);
            return ResponseEntity.ok(nueva);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{ \"error\": \"" + e.getMessage() + "\" }");
        }
    }

    @GetMapping("/hoy")
    public ResponseEntity<Double> getVentasDeHoy() {
        LocalDate hoy = LocalDate.now();
        LocalDateTime inicio = hoy.atStartOfDay();
        LocalDateTime fin = hoy.plusDays(1).atStartOfDay();

        double total = ventaRepository.sumTotalByFechaRange(inicio, fin)
                .orElse(0.0); // si no hay ventas hoy, devuelve 0
        return ResponseEntity.ok(total);
    }

}
