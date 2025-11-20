import React, { useEffect, useState } from "react";
import { Card, Table, Alert, Badge } from "react-bootstrap";

interface DetalleVenta {
  id: string;
  producto: {
    nombre: string;
    precio: number;
  };
  cantidad: number;
  subtotal: number;
}

interface Venta {
  id: string;
  fecha: string;
  total: number;
  cliente: {
    nombre: string;
    email: string;
  };
  empleado: {
    nombre: string;
  };
  sucursal: {
    nombre: string;
  };
  detalles: DetalleVenta[];
}

const MySales: React.FC = () => {
  const API_BASE_URL = "http://localhost:9090/api";
  const empleadoNombre = localStorage.getItem("nombre");

  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVentas();
  }, []);

  const fetchVentas = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/ventas`);
      if (!response.ok) throw new Error("Error al cargar ventas");

      const data: Venta[] = await response.json();

      // Filtrar solo las ventas del empleado actual
      const misVentas = data.filter((v) => v.empleado.nombre === empleadoNombre);
      setVentas(misVentas);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Alert variant="info">Cargando ventas...</Alert>;
  }

  const totalVentas = ventas.length;
  const totalIngresos = ventas.reduce((sum, v) => sum + v.total, 0);

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="fw-bold text-primary">📦 Mis Ventas Registradas</h1>
          <p className="text-muted">Historial de ventas realizadas por {empleadoNombre}</p>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Estadísticas rápidas */}
      <div className="row mb-4 gap-3">
        <div className="col-md-3">
          <Card className="shadow-sm border-0 text-center">
            <Card.Body>
              <h6 className="text-muted mb-2">Total de Ventas</h6>
              <h3 className="fw-bold text-primary">{totalVentas}</h3>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="shadow-sm border-0 text-center">
            <Card.Body>
              <h6 className="text-muted mb-2">Ingresos Totales</h6>
              <h3 className="fw-bold text-success">${totalIngresos.toFixed(2)}</h3>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Tabla de ventas */}
      <div className="row">
        <div className="col-12">
          <Card className="shadow-sm border-0">
            <Card.Body>
              {ventas.length > 0 ? (
                <Table striped bordered hover>
                  <thead className="table-light">
                    <tr>
                      <th>Fecha</th>
                      <th>Cliente</th>
                      <th>Sucursal</th>
                      <th className="text-center">Productos</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventas.map((venta) => (
                      <tr key={venta.id}>
                        <td>
                          <small>{new Date(venta.fecha).toLocaleString("es-ES")}</small>
                        </td>
                        <td className="fw-bold">{venta.cliente.nombre}</td>
                        <td>{venta.sucursal.nombre}</td>
                        <td className="text-center">
                          <Badge bg="info">{venta.detalles?.length || 0}</Badge>
                        </td>
                        <td className="text-end text-success fw-bold">${venta.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-5 text-muted">
                  <p>No tienes ventas registradas aún.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MySales;
