package uis.entornos.backend_nosql.controller;

import org.springframework.web.bind.annotation.*;
import uis.entornos.backend_nosql.dto.EmpleadoDTO;
import uis.entornos.backend_nosql.dto.EmpleadoWithSucursalDTO;
import uis.entornos.backend_nosql.model.Empleado;
import uis.entornos.backend_nosql.model.Role;
import uis.entornos.backend_nosql.model.Sucursal;
import uis.entornos.backend_nosql.repository.EmpleadoRepository;
import uis.entornos.backend_nosql.repository.SucursalRepository;

import java.util.List;

@RestController
@RequestMapping("/api/empleados")
public class EmpleadoController {

    private final EmpleadoRepository empleadoRepository;
    private final SucursalRepository sucursalRepository;

    public EmpleadoController(EmpleadoRepository empleadoRepository, SucursalRepository sucursalRepository) {
        this.empleadoRepository = empleadoRepository;
        this.sucursalRepository = sucursalRepository;
    }

    // 🔹 Listar empleados con datos de sucursal
    @GetMapping
    public List<EmpleadoWithSucursalDTO> listar() {
        List<Empleado> list = empleadoRepository.findAll();
        return list.stream().map(e -> {
            EmpleadoWithSucursalDTO dto = new EmpleadoWithSucursalDTO();
            dto.setId(e.getId());
            dto.setNombre(e.getNombre());
            dto.setUsuario(e.getUsuario());
            dto.setCargo(e.getCargo());
            dto.setSalario(e.getSalario());
            dto.setEmail(e.getEmail());
            dto.setRole(e.getRole() != null ? e.getRole().name() : null);
            if (e.getSucursal() != null) {
                dto.setSucursalId(e.getSucursal().getId());
                dto.setSucursalNombre(e.getSucursal().getNombre());
            }
            return dto;
        }).toList();
    }

    // 🔹 Crear nuevo empleado
    @PostMapping
    public Empleado crear(@RequestBody EmpleadoDTO dto) {
        Empleado e = new Empleado();
        e.setNombre(dto.getNombre());
        e.setUsuario(dto.getUsuario());
        e.setCargo(dto.getCargo());
        e.setSalario(dto.getSalario());
        e.setEmail(dto.getEmail());
        e.setPassword(dto.getPassword());
        e.setRole(dto.getRole());

        if (dto.getRole() == Role.EMPLOYEE) {
            if (dto.getSucursalId() == null)
                throw new RuntimeException("El empleado con role EMPLOYEE debe tener sucursal asignada");
            Sucursal s = sucursalRepository.findById(dto.getSucursalId())
                    .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
            e.setSucursal(s);
        } else {
            e.setSucursal(null);
        }

        return empleadoRepository.save(e);
    }

    // 🔹 Actualizar empleado
    @PutMapping("/{id}")
    public Empleado actualizar(@PathVariable String id, @RequestBody EmpleadoDTO dto) {
        Empleado e = empleadoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        e.setNombre(dto.getNombre());
        e.setUsuario(dto.getUsuario());
        e.setCargo(dto.getCargo());
        e.setSalario(dto.getSalario());
        e.setEmail(dto.getEmail());
        e.setPassword(dto.getPassword());
        e.setRole(dto.getRole());

        if (dto.getRole() == Role.EMPLOYEE) {
            if (dto.getSucursalId() == null)
                throw new RuntimeException("El empleado con role EMPLOYEE debe tener sucursal asignada");
            Sucursal s = sucursalRepository.findById(dto.getSucursalId())
                    .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
            e.setSucursal(s);
        } else {
            e.setSucursal(null);
        }

        return empleadoRepository.save(e);
    }

    // 🔹 Eliminar empleado
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable String id) {
        empleadoRepository.deleteById(id);
    }

    // 🔹 Obtener un empleado por ID
    @GetMapping("/{id}")
    public Empleado obtener(@PathVariable String id) {
        return empleadoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));
    }
}
