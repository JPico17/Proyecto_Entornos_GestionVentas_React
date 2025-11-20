import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";

interface Venta {
  id: string;
  numVenta: string;
  total: number;
  fecha: string;
}

interface Sucursal {
  id: string;
  nombre: string;
}

const Administracion: React.FC = () => {
  const API_BASE_URL = "http://localhost:9090/api";

  const [ventasTotales, setVentasTotales] = useState<number>(0);
  const [productosVendidos, setProductosVendidos] = useState<number>(0);
  const [sucursalesActivas, setSucursalesActivas] = useState<number>(0);
  const [ventasRecientes, setVentasRecientes] = useState<Venta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener todas las ventas
        const ventasResponse = await fetch(`${API_BASE_URL}/ventas`);
        if (!ventasResponse.ok) throw new Error("Error al obtener ventas");
        const ventas: Venta[] = await ventasResponse.json();

        // Calcular ventas totales
        const total = ventas.reduce((sum, v) => sum + (v.total || 0), 0);
        setVentasTotales(total);

        // Calcular productos vendidos (asumiendo que cada venta tiene detalles)
        const totalProductos = ventas.length;
        setProductosVendidos(totalProductos);

        // Obtener sucursales
        const sucursalesResponse = await fetch(`${API_BASE_URL}/sucursales`);
        if (!sucursalesResponse.ok) throw new Error("Error al obtener sucursales");
        const sucursales: Sucursal[] = await sucursalesResponse.json();
        setSucursalesActivas(sucursales.length);

        // Últimas 5 ventas
        const ultimasVentas = ventas.slice(-5).reverse();
        setVentasRecientes(ultimasVentas);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        console.error("Error al cargar datos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="fw-bold text-primary">📊 Panel de Administración</h1>
            <p className="text-muted">Cargando datos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="fw-bold text-primary">📊 Panel de Administración</h1>
          <p className="text-muted">
            Bienvenido al sistema de gestión de ventas. Aquí puedes ver un
            resumen general de la actividad de tu negocio.
          </p>
          {error && <div className="alert alert-warning">{error}</div>}
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="row g-4">
        <div className="col-md-4">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h5 className="card-title text-success">💰 Ventas totales</h5>
              <h2 className="fw-bold">${ventasTotales.toFixed(2)}</h2>
              <p className="text-muted">Total en el sistema</p>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-4">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h5 className="card-title text-primary">📦 Ventas registradas</h5>
              <h2 className="fw-bold">{productosVendidos}</h2>
              <p className="text-muted">Transacciones en total</p>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-4">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h5 className="card-title text-warning">🏬 Sucursales activas</h5>
              <h2 className="fw-bold">{sucursalesActivas}</h2>
              <p className="text-muted">Con registros en el sistema</p>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Sección adicional */}
      <div className="row mt-5">
        <div className="col-lg-8">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h5 className="card-title">📈 Resumen de ventas</h5>
              <p className="text-muted">
                Total de {productosVendidos} transacciones registradas por un monto de ${ventasTotales.toFixed(2)}
              </p>
            </Card.Body>
          </Card>
        </div>

        <div className="col-lg-4">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h5 className="card-title">🧑‍💼 Últimas ventas registradas</h5>
              {ventasRecientes.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {ventasRecientes.map((venta) => (
                    <li key={venta.id} className="list-group-item">
                      📦 Venta #{venta.numVenta} – ${venta.total.toFixed(2)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No hay ventas registradas</p>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Administracion;
