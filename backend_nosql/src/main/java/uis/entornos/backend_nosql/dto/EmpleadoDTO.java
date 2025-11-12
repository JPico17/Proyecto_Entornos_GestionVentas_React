package uis.entornos.backend_nosql.dto;

import uis.entornos.backend_nosql.model.Role;
import java.math.BigDecimal;

/**
 * DTO para la entidad Empleado (MongoDB)
 * Se usa para transferir datos entre la capa de presentación y la capa de
 * negocio.
 */
public class EmpleadoDTO {

    private String id; // En MongoDB el ID suele ser un String (ObjectId representado como String)
    private String nombre;
    private String usuario;
    private String cargo;
    private BigDecimal salario;
    private String email;
    private String password;
    private Role role;
    private String sucursalId; // También como String, ya que referenciarías otro documento

    // --- Getters y Setters ---
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

    public String getSucursalId() {
        return sucursalId;
    }

    public void setSucursalId(String sucursalId) {
        this.sucursalId = sucursalId;
    }
}
