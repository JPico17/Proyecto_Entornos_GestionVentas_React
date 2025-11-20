import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Login: React.FC = () => {
  const [identificador, setIdentificador] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:9090/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identificador, password }),
      });

      if (!res.ok) {
        const msg = await res.text();
        setError("❌ Error al iniciar sesión: " + (msg || res.status));
        return;
      }

      const user = await res.json();
      console.log("🔹 USER LOGIN:", user);

      // ===============================
      // 1️⃣ Normalizar valores
      // ===============================
      const role = (user.role || "").toUpperCase();
      const sucursalId = user.sucursalId ?? "";

      // ===============================
      // 2️⃣ Guardar token
      // ===============================
      if (user.token) {
        localStorage.setItem("token", user.token);
      }

      // ===============================
      // 3️⃣ Validar sucursal solo si NO es admin
      // ===============================
      if (role !== "ADMIN" && !sucursalId) {
        setError("⚠️ El empleado no tiene sucursal asignada.");
        return;
      }

      // ===============================
      // 4️⃣ Guardar datos en localStorage
      // ===============================
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("empleadoId", user.id || "");
      localStorage.setItem("sucursalId", sucursalId);
      localStorage.setItem("role", role);
      localStorage.setItem("nombre", user.nombre || "");
      localStorage.setItem("email", user.email || "");

      // ===============================
      // 5️⃣ Obtener nombre de la sucursal
      // ===============================
      if (sucursalId) {
        try {
          const resSuc = await fetch(`http://localhost:9090/api/sucursales/${sucursalId}`);
          if (resSuc.ok) {
            const suc = await resSuc.json();
            localStorage.setItem("sucursalNombre", suc.nombre || "Sucursal");
          } else {
            localStorage.setItem("sucursalNombre", "Sucursal");
          }
        } catch {
          localStorage.setItem("sucursalNombre", "Sucursal");
        }
      }

      // ===============================
      // 6️⃣ Redirigir SIN delay ni parches
      // ===============================
      if (role === "ADMIN") {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/mis-ventas";
      }

    } catch (error) {
      console.error("Error al conectar con el backend:", error);
      setError("⚠️ No se pudo conectar con el servidor.");
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center bg-light"
      style={{ minHeight: "85vh" }}
    >
      <div
        className="card shadow-lg border-0"
        style={{ width: "100%", maxWidth: "420px", borderRadius: "12px" }}
      >
        <div className="card-body p-4">
          <h2 className="text-center mb-4 text-primary">Inicio de Sesión</h2>

          {error && (
            <div className="alert alert-danger text-center" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Usuario</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ingresa tu usuario"
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Contraseña</label>
              <input
                type="password"
                className="form-control"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2">
              Iniciar Sesión
            </button>
          </form>

          <div
            className="text-center mt-3 text-muted"
            style={{ fontSize: "0.9rem" }}
          >
            © {new Date().getFullYear()} Sistema de Gestión de Ventas
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;





