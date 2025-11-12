package uis.entornos.backend_nosql.controller;

import uis.entornos.backend_nosql.model.Sucursal;
import uis.entornos.backend_nosql.repository.SucursalRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sucursales")
@CrossOrigin(origins = "*")
public class SucursalController {

    private final SucursalRepository sucursalRepository;

    public SucursalController(SucursalRepository sucursalRepository) {
        this.sucursalRepository = sucursalRepository;
    }

    @GetMapping
    public List<Sucursal> listar() {
        return sucursalRepository.findAll();
    }

    @PostMapping
    public Sucursal crear(@RequestBody Sucursal sucursal) {
        return sucursalRepository.save(sucursal);
    }

    @GetMapping("/{id}")
    public Sucursal obtenerPorId(@PathVariable String id) {
        return sucursalRepository.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Sucursal actualizar(@PathVariable String id, @RequestBody Sucursal sucursal) {
        sucursal.setId(id);
        return sucursalRepository.save(sucursal);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable String id) {
        sucursalRepository.deleteById(id);
    }
}
