package uis.entornos.backend_nosql.controller;

import org.springframework.web.bind.annotation.*;
import uis.entornos.backend_nosql.model.Producto;
import uis.entornos.backend_nosql.model.Sucursal;
import uis.entornos.backend_nosql.repository.ProductoRepository;
import uis.entornos.backend_nosql.repository.SucursalRepository;
import uis.entornos.backend_nosql.dto.ProductoDTO;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    private final ProductoRepository productoRepository;
    private final SucursalRepository sucursalRepository;

    public ProductoController(ProductoRepository productoRepository, SucursalRepository sucursalRepository) {
        this.productoRepository = productoRepository;
        this.sucursalRepository = sucursalRepository;
    }

    // 🔹 Listar productos (opcionalmente filtrados por sucursal)
    @GetMapping
    public List<Producto> listar(@RequestParam(name = "sucursalId", required = false) String sucursalId) {
        if (sucursalId != null) {
            // Buscar la sucursal para filtrar por referencia
            Sucursal s = sucursalRepository.findById(sucursalId)
                    .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
            return productoRepository.findBySucursal(s);
        }
        return productoRepository.findAll();
    }

    // 🔹 Crear producto
    @PostMapping
    public Producto crear(@RequestBody ProductoDTO dto) {
        Producto p = new Producto();
        p.setNombre(dto.getNombre());
        p.setPrecio(dto.getPrecio());
        p.setStock(dto.getStock());

        if (dto.getSucursalId() != null) {
            Sucursal s = sucursalRepository.findById(dto.getSucursalId())
                    .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
            p.setSucursal(s);
        } else {
            p.setSucursal(null);
        }

        return productoRepository.save(p);
    }

    // 🔹 Actualizar producto
    @PutMapping("/{id}")
    public Producto actualizar(@PathVariable String id, @RequestBody ProductoDTO dto) {
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no existe"));

        p.setNombre(dto.getNombre());
        p.setPrecio(dto.getPrecio());
        p.setStock(dto.getStock());

        if (dto.getSucursalId() != null) {
            Sucursal s = sucursalRepository.findById(dto.getSucursalId())
                    .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
            p.setSucursal(s);
        } else {
            p.setSucursal(null);
        }

        return productoRepository.save(p);
    }

    // 🔹 Eliminar producto
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable String id) {
        productoRepository.deleteById(id);
    }

    // 🔹 Obtener producto por ID
    @GetMapping("/{id}")
    public Producto obtener(@PathVariable String id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No encontrado"));
    }
}
