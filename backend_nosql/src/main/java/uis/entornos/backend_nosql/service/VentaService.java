package uis.entornos.backend_nosql.service;

import org.springframework.stereotype.Service;
import uis.entornos.backend_nosql.repository.*;
import uis.entornos.backend_nosql.model.*;
import uis.entornos.backend_nosql.dto.VentaDTO;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class VentaService {

    private final VentaRepository ventaRepo;
    private final ProductoRepository productoRepo;
    private final ClienteRepository clienteRepo;
    private final EmpleadoRepository empleadoRepo;
    private final SucursalRepository sucursalRepo;

    public VentaService(
            VentaRepository ventaRepo,
            ProductoRepository productoRepo,
            ClienteRepository clienteRepo,
            EmpleadoRepository empleadoRepo,
            SucursalRepository sucursalRepo) {
        this.ventaRepo = ventaRepo;
        this.productoRepo = productoRepo;
        this.clienteRepo = clienteRepo;
        this.empleadoRepo = empleadoRepo;
        this.sucursalRepo = sucursalRepo;
    }

    public Venta registrarVenta(VentaDTO dto) {
        Cliente cliente = clienteRepo.findById(String.valueOf(dto.getClienteId())).orElseThrow();
        Empleado empleado = empleadoRepo.findById(String.valueOf(dto.getEmpleadoId())).orElseThrow();
        Sucursal sucursal = sucursalRepo.findById(String.valueOf(dto.getSucursalId())).orElseThrow();

        Venta venta = new Venta();
        venta.setCliente(cliente);
        venta.setEmpleado(empleado);
        venta.setSucursal(sucursal);

        List<DetalleVenta> detalles = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (VentaDTO.Item item : dto.getItems()) {
            Producto producto = productoRepo.findById(String.valueOf(item.getProductoId())).orElseThrow();

            if (producto.getStock() < item.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para producto: " + producto.getNombre());
            }

            producto.setStock(producto.getStock() - item.getCantidad());
            productoRepo.save(producto);

            DetalleVenta det = new DetalleVenta();
            det.setProducto(producto);
            det.setCantidad(item.getCantidad());
            BigDecimal subtotal = producto.getPrecio().multiply(BigDecimal.valueOf(item.getCantidad()));
            det.setSubtotal(subtotal);
            detalles.add(det);

            total = total.add(subtotal);
        }

        venta.setDetalles(detalles);
        venta.setTotal(total);

        return ventaRepo.save(venta);
    }

    public List<Venta> listarTodas() {
        List<Venta> ventas = ventaRepo.findAll();
        // Mongo ya devuelve toda la estructura, no hay lazy loading
        return ventas;
    }

    public List<DetalleVenta> listarDetallesPorVenta(String ventaId) {
        return ventaRepo.findById(ventaId)
                .map(Venta::getDetalles)
                .orElse(List.of());
    }
}
