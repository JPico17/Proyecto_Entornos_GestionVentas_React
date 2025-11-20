import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/navbar/navbar";
import Sidebar from "./components/sidebar/Sidebar";
import Login from "./login/login";
import Administracion from "./components/views/administracion";
import MySales from "./components/MySales/MySales";
import SalesForm from "./components/SalesForm/SalesForm";
import Sucursales from "./components/views/Sucursales";
import Productos from "./components/views/Productos";
import Empleados from "./components/views/Empleados";


const App: React.FC = () => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const savedRole = localStorage.getItem("role"); // ADMIN o EMPLOYEE
    // Normalizar a los valores que usa la UI: "admin" | "empleado"
    let normalized: string | null = null;
    if (savedRole) {
      const up = savedRole.toUpperCase();
      if (up === "ADMIN") normalized = "admin";
      else if (up === "EMPLOYEE") normalized = "empleado";
      else normalized = savedRole.toLowerCase();
    }
    setRole(normalized);
    setLoading(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.clear();
    setRole(null);
    window.location.href = "/";
  };

  // 🛑 Mientras se carga el rol → no renderizar nada
  if (loading) return null;

  const isLoginPage = location.pathname === "/";

  // 🔐 Redirigir a login si no hay rol y no estamos en login
  if (!role && !isLoginPage) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar solo después del login */}
      {!isLoginPage && role && <Sidebar role={role.toLowerCase() as "admin" | "empleado"} />}

      <div className="flex-grow-1 d-flex flex-column">
        {/* Navbar solo después del login */}
        {!isLoginPage && role && <Navbar onLogout={handleLogout} />}

        <main
          className="p-4 bg-light"
          style={{
            flexGrow: 1,
            marginLeft: !isLoginPage && role ? "280px" : "0",
            marginTop: !isLoginPage && role ? "70px" : "0",
            minHeight: "100vh",
            transition: "all 0.3s ease", // 👌 transición suave
          }}
        >
          <Routes>
            {/* Página de login */}
            <Route path="/" element={<Login />} />

            {/* Rutas protegidas */}
            {role && (
              <>
                <Route path="/administracion" element={<Administracion />} />
                <Route path="/sucursales" element={role === "admin" ? <Sucursales /> : <Navigate to="/administracion" replace />} />
                <Route path="/empleados" element={role === "admin" ? <Empleados /> : <Navigate to="/administracion" replace />} />
                <Route path="/productos" element={<Productos />} />
                <Route path="/mis-ventas" element={role === "empleado" ? <MySales /> : <Navigate to="/administracion" replace />} />
                <Route path="/registrar-venta" element={role === "empleado" ? <SalesForm /> : <Navigate to="/administracion" replace />} />
                {/* Redirección por defecto */}
                <Route path="*" element={<Navigate to="/administracion" replace />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
