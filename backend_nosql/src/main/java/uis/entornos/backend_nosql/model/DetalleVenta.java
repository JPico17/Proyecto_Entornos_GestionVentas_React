package uis.entornos.backend_nosql.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.math.BigDecimal;

@Document(collection = "detalles_venta")
public class DetalleVenta {

    @Id
    private String id;

    @DBRef
    private Venta venta; // referencia a la venta

    @DBRef
    private Producto producto; // referencia al producto

    private Integer cantidad;
    private BigDecimal subtotal;

    public DetalleVenta() {
    }

    public DetalleVenta(Venta venta, Producto producto, Integer cantidad, BigDecimal subtotal) {
        this.venta = venta;
        this.producto = producto;
        this.cantidad = cantidad;
        this.subtotal = subtotal;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Venta getVenta() {
        return venta;
    }

    public void setVenta(Venta venta) {
        this.venta = venta;
    }

    public Producto getProducto() {
        return producto;
    }

    public void setProducto(Producto producto) {
        this.producto = producto;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }
}
