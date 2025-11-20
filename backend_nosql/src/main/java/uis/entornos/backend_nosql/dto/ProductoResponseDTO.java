package uis.entornos.backend_nosql.dto;

import java.math.BigDecimal;

public class ProductoResponseDTO {
    private String id;
    private String nombre;
    private BigDecimal precio;
    private Integer stock;
    private String sucursalId;
    private String sucursalNombre;

    public ProductoResponseDTO() {
    }

    public ProductoResponseDTO(String id, String nombre, BigDecimal precio, Integer stock, String sucursalId, String sucursalNombre) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.stock = stock;
        this.sucursalId = sucursalId;
        this.sucursalNombre = sucursalNombre;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public BigDecimal getPrecio() {
        return precio;
    }

    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public String getSucursalId() {
        return sucursalId;
    }

    public void setSucursalId(String sucursalId) {
        this.sucursalId = sucursalId;
    }

    public String getSucursalNombre() {
        return sucursalNombre;
    }

    public void setSucursalNombre(String sucursalNombre) {
        this.sucursalNombre = sucursalNombre;
    }
}
