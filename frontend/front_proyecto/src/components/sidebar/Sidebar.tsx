import React from "react";
import { Link, useLocation } from "react-router-dom";
import { House, FilePlus, Package, MapPin, Users, UserRound } from "lucide-react";

interface SidebarProps {
  role: "admin" | "empleado";
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const location = useLocation();

  const menuItemClass = (path: string) =>
    `nav-link d-flex align-items-center gap-2 px-3 py-2 rounded ${
      location.pathname === path
        ? "bg-primary text-white"
        : "text-dark"
    }`;

  return (
    <div
      className="d-flex flex-column bg-white border-end shadow-sm position-fixed"
      style={{
        width: "280px",
        height: "100vh",
        top: 0,
        left: 0,
        zIndex: 100,
      }}
    >
      {/* Header */}
      <div className="p-3 border-bottom">
        <h4 className="fw-bold text-primary mb-0">📊 Gestión</h4>
      </div>

      {/* Menu */}
      <div className="flex-grow-1 p-2">
        <ul className="nav flex-column gap-1">
          
          {/* Inicio - sólo admin */}
          {role === "admin" && (
            <li className="nav-item">
              <Link to="/administracion" className={menuItemClass("/administracion")}>
                <House size={20} /> Inicio
              </Link>
            </li>
          )}

          {/* Productos - visible para todos los roles autenticados */}
          <li className="nav-item">
            <Link to="/productos" className={menuItemClass("/productos")}>
              <Package size={20} /> Productos
            </Link>
          </li>

          {/* Solo admin */}
          {role === "admin" && (
            <>
              
              <li className="nav-item">
                <Link to="/sucursales" className={menuItemClass("/sucursales")}>
                  <MapPin size={20} /> Sucursales
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/empleados" className={menuItemClass("/empleados")}>
                  <Users size={20} /> Empleados
                </Link>
              </li>
            </>
          )}

          {/* Solo empleados */}
          {role === "empleado" && (
            <>
              <li className="nav-item">
              <Link to="/clientes" className={menuItemClass("/clientes")}>
                <UserRound size={20} /> Clientes
              </Link>
              </li>
              <li className="nav-item">
                <Link to="/registrar-venta" className={menuItemClass("/registrar-venta")}>
                  <FilePlus size={20} /> Registrar Venta
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/mis-ventas" className={menuItemClass("/mis-ventas")}>
                  <Package size={20} /> Mis Ventas
                </Link>
              </li>
              

            </>
            
          )}
        </ul>
      </div>

      {/* Footer */}
      <div className="text-center small text-muted py-3 border-top">
        © {new Date().getFullYear()} Ventas
      </div>
    </div>
  );
};


export default Sidebar;

