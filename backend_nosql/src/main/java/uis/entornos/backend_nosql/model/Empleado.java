package uis.entornos.backend_nosql.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;

@Document(collection = "empleados") // equivale a una tabla en SQL
@JsonIgnoreProperties({ "sucursal" })
public class Empleado {

    @Id
    private String id; // Mongo usa String (ObjectId) en lugar de Long

    private String nombre;
    private String usuario;
    private String cargo;
    private BigDecimal salario;
    private String email;
    private String password;
    private Role role;

    // Relación con otra colección (referencia)
    @DBRef
    private Sucursal sucursal;

    public Empleado() {
    }

    public Empleado(String nombre, String usuario, String cargo, BigDecimal salario, String email, String password,
            Role role, Sucursal sucursal) {
        this.nombre = nombre;
        this.usuario = usuario;
        this.cargo = cargo;
        this.salario = salario;
        this.email = email;
        this.password = password;
        this.role = role;
        this.sucursal = sucursal;
    }

    // Getters y Setters
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

    public String getUsuario() {
        return usuario;
    }

    public void setUsuario(String usuario) {
        this.usuario = usuario;
    }

    public String getCargo() {
        return cargo;
    }

    public void setCargo(String cargo) {
        this.cargo = cargo;
    }

    public BigDecimal getSalario() {
        return salario;
    }

    public void setSalario(BigDecimal salario) {
        this.salario = salario;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Sucursal getSucursal() {
        return sucursal;
    }

    public void setSucursal(Sucursal sucursal) {
        this.sucursal = sucursal;
    }
}
