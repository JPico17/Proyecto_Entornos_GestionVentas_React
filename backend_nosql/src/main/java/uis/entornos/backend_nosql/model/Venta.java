package uis.entornos.backend_nosql.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "ventas")
public class Venta {

    @Id
    private String id;

    private LocalDateTime fecha = LocalDateTime.now();
    private BigDecimal total;

    @DBRef
    private Sucursal sucursal;

    @DBRef
    private Empleado empleado;

    @DBRef
    private Cliente cliente;

    
    private List<DetalleVenta> detalles;

    public Venta() {
    }

    public Venta(LocalDateTime fecha, BigDecimal total, Sucursal sucursal, Empleado empleado, Cliente cliente,
            List<DetalleVenta> detalles) {
        this.fecha = fecha;
        this.total = total;
        this.sucursal = sucursal;
        this.empleado = empleado;
        this.cliente = cliente;
        this.detalles = detalles;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public Sucursal getSucursal() {
        return sucursal;
    }

    public void setSucursal(Sucursal sucursal) {
        this.sucursal = sucursal;
    }

    public Empleado getEmpleado() {
        return empleado;
    }

    public void setEmpleado(Empleado empleado) {
        this.empleado = empleado;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public List<DetalleVenta> getDetalles() {
        return detalles;
    }

    public void setDetalles(List<DetalleVenta> detalles) {
        this.detalles = detalles;
    }
}
