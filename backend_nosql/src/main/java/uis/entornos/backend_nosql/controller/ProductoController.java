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
    public List<uis.entornos.backend_nosql.dto.ProductoResponseDTO> listar(@RequestParam(name = "sucursalId", required = false) String sucursalId) {
        List<Producto> productos;
        if (sucursalId != null) {
            // Buscar la sucursal para filtrar por referencia
            Sucursal s = sucursalRepository.findById(sucursalId)
                    .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
            productos = productoRepository.findBySucursal(s);
        } else {
            productos = productoRepository.findAll();
        }

        // Mapear a DTO de respuesta con nombre de sucursal
        List<uis.entornos.backend_nosql.dto.ProductoResponseDTO> respuesta = new java.util.ArrayList<>();
        for (Producto p : productos) {
            uis.entornos.backend_nosql.dto.ProductoResponseDTO dto = new uis.entornos.backend_nosql.dto.ProductoResponseDTO();
            dto.setId(p.getId());
            dto.setNombre(p.getNombre());
            dto.setPrecio(p.getPrecio());
            dto.setStock(p.getStock());

            // Intentar obtener id/nombre de la sucursal de forma segura
            if (p.getSucursal() != null) {
                String sucId = p.getSucursal().getId();
                dto.setSucursalId(sucId);
                // Puede que la referencia DBRef no esté poblada; si no hay nombre, fetch explícito
                String sucNombre = p.getSucursal().getNombre();
                if (sucNombre == null || sucNombre.isEmpty()) {
                    // intentar cargar desde el repositorio
                    Sucursal sFull = sucursalRepository.findById(sucId).orElse(null);
                    if (sFull != null) sucNombre = sFull.getNombre();
                }
                dto.setSucursalNombre(sucNombre);
            } else {
                dto.setSucursalId(null);
                dto.setSucursalNombre(null);
            }

            respuesta.add(dto);
        }

        return respuesta;
    }

    // 🔹 Crear producto
    @PostMapping
    public Producto crear(@RequestBody ProductoDTO dto) {
        // Validar que la sucursal sea obligatoria
        if (dto.getSucursalId() == null || dto.getSucursalId().trim().isEmpty()) {
            throw new RuntimeException("La sucursal es obligatoria");
        }

        Producto p = new Producto();
        p.setNombre(dto.getNombre());
        p.setPrecio(dto.getPrecio());
        p.setStock(dto.getStock());

        Sucursal s = sucursalRepository.findById(dto.getSucursalId())
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
        p.setSucursal(s);

        return productoRepository.save(p);
    }

    // 🔹 Actualizar producto
    @PutMapping("/{id}")
    public Producto actualizar(@PathVariable String id, @RequestBody ProductoDTO dto) {
        // Validar que la sucursal sea obligatoria
        if (dto.getSucursalId() == null || dto.getSucursalId().trim().isEmpty()) {
            throw new RuntimeException("La sucursal es obligatoria");
        }

        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no existe"));

        p.setNombre(dto.getNombre());
        p.setPrecio(dto.getPrecio());
        p.setStock(dto.getStock());

        Sucursal s = sucursalRepository.findById(dto.getSucursalId())
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
        p.setSucursal(s);

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
