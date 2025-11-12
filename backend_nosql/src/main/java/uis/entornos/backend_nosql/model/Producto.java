package uis.entornos.backend_nosql.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;

@Document(collection = "productos") // nombre de la colección en Mongo
@JsonIgnoreProperties({ "sucursal" })
public class Producto {

    @Id
    private String id; // Mongo usa String/ObjectId

    private String nombre;
    private BigDecimal precio;
    private Integer stock;

    // Referencia a la sucursal (no se embebe, se guarda el ID)
    @DBRef
    @JsonIgnoreProperties({ "empleados", "productos" })
    private Sucursal sucursal;

    public Producto() {
    }

    public Producto(String nombre, BigDecimal precio, Integer stock, Sucursal sucursal) {
        this.nombre = nombre;
        this.precio = precio;
        this.stock = stock;
        this.sucursal = sucursal;
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

    public Sucursal getSucursal() {
        return sucursal;
    }

    public void setSucursal(Sucursal sucursal) {
        this.sucursal = sucursal;
    }
}
