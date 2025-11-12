package uis.entornos.backend_nosql.dto;

import java.util.List;

/**
 * DTO para registrar una venta.
 * Adaptado para MongoDB: los IDs son tipo String en lugar de Long.
 */
public class VentaDTO {

    private String clienteId;
    private String empleadoId;
    private String sucursalId;
    private List<Item> items;

    public String getClienteId() {
        return clienteId;
    }

    public void setClienteId(String clienteId) {
        this.clienteId = clienteId;
    }

    public String getEmpleadoId() {
        return empleadoId;
    }

    public void setEmpleadoId(String empleadoId) {
        this.empleadoId = empleadoId;
    }

    public String getSucursalId() {
        return sucursalId;
    }

    public void setSucursalId(String sucursalId) {
        this.sucursalId = sucursalId;
    }

    public List<Item> getItems() {
        return items;
    }

    public void setItems(List<Item> items) {
        this.items = items;
    }

    /**
     * Subclase interna que representa cada producto dentro de una venta.
     */
    public static class Item {
        private String productoId;
        private Integer cantidad;

        public String getProductoId() {
            return productoId;
        }

        public void setProductoId(String productoId) {
            this.productoId = productoId;
        }

        public Integer getCantidad() {
            return cantidad;
        }

        public void setCantidad(Integer cantidad) {
            this.cantidad = cantidad;
        }
    }
}
