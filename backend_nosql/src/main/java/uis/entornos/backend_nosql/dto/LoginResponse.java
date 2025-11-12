package uis.entornos.backend_nosql.dto;

public class LoginResponse {
    private String username;
    private String rol;
    private String mensaje;

    public LoginResponse(String username, String rol, String mensaje) {
        this.username = username;
        this.rol = rol;
        this.mensaje = mensaje;
    }

    public String getUsername() {
        return username;
    }

    public String getRol() {
        return rol;
    }

    public String getMensaje() {
        return mensaje;
    }
}
