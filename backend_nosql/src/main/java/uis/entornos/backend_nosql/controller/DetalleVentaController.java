package uis.entornos.backend_nosql.controller;

import uis.entornos.backend_nosql.model.DetalleVenta;
import uis.entornos.backend_nosql.repository.DetalleVentaRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/detalleventas")
@CrossOrigin(origins = "*")
public class DetalleVentaController {

    private final DetalleVentaRepository detalleVentaRepository;

    public DetalleVentaController(DetalleVentaRepository detalleVentaRepository) {
        this.detalleVentaRepository = detalleVentaRepository;
    }

    @GetMapping
    public List<DetalleVenta> listar() {
        return detalleVentaRepository.findAll();
    }

    @PostMapping
    public DetalleVenta crear(@RequestBody DetalleVenta detalleVenta) {
        return detalleVentaRepository.save(detalleVenta);
    }

    @GetMapping("/{id}")
    public Optional<DetalleVenta> obtenerPorId(@PathVariable String id) {
        return detalleVentaRepository.findById(id);
    }

    @PutMapping("/{id}")
    public DetalleVenta actualizar(@PathVariable String id, @RequestBody DetalleVenta detalleVenta) {
        detalleVenta.setId(id);
        return detalleVentaRepository.save(detalleVenta);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable String id) {
        detalleVentaRepository.deleteById(id);
    }
}
