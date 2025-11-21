import React, { useEffect, useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { Bar, Pie } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

interface Venta {
  id: string;
  numVenta: string;
  total: number;
  fecha: string;
  sucursal?: {
    id: string;
    nombre: string;
  };
}

interface Sucursal {
  id: string;
  nombre: string;
}

const Administracion: React.FC = () => {
  const API_BASE_URL = "http://localhost:9090/api";

  // Role desde localStorage
  const storedRole = localStorage.getItem("role");
  const role = storedRole ? storedRole.toUpperCase() : null;

  const [ventasTotales, setVentasTotales] = useState<number>(0);
  const [productosVendidos, setProductosVendidos] = useState<number>(0);
  const [sucursalesActivas, setSucursalesActivas] = useState<number>(0);
  const [ventasRecientes, setVentasRecientes] = useState<Venta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSucursal, setSelectedSucursal] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [productos] = useState<any[]>([]);
  const [filteredVentas, setFilteredVentas] = useState<Venta[]>([]);

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
        const sucursalesData: Sucursal[] = await sucursalesResponse.json();
        setSucursales(sucursalesData);
        setSucursalesActivas(sucursalesData.length);

        // Últimas 5 ventas
        const ultimasVentas = ventas.slice(-5).reverse();
        setVentasRecientes(ultimasVentas);
        setFilteredVentas(ventas);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        console.error("Error al cargar datos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Eliminar el efecto que actualiza automáticamente los filtros

  const handleSucursalChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSucursal(event.target.value);
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (selectedSucursal) params.append("sucursalId", selectedSucursal);
      if (startDate) params.append("fechaInicio", startDate.toISOString().split("T")[0]);
      if (endDate) params.append("fechaFin", endDate.toISOString().split("T")[0]);

      const response = await fetch(`${API_BASE_URL}/ventas/filtrar?${params.toString()}`);
      if (!response.ok) throw new Error("Error al filtrar ventas");

      const ventas: Venta[] = await response.json();

      // Calcular ventas totales y productos vendidos
      const total = ventas.reduce((sum, v) => sum + (v.total || 0), 0);
      setVentasTotales(total);
      setProductosVendidos(ventas.length);

      // Actualizar ventas recientes
      const ultimasVentas = ventas.slice(-5).reverse();
      setVentasRecientes(ultimasVentas);

      // Actualizar datos de gráficas
      setFilteredVentas(ventas);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      console.error("Error al cargar datos filtrados:", err);
    } finally {
      setLoading(false);
    }
  };

  // === Adaptación de gráficas tipo dashboard JS ===
  // Serie temporal de ventas (línea)
  // Serie temporal de ventas (línea) - corregido para mostrar el día de hoy
  const ventasPorDia = filteredVentas.reduce((acc, v) => {
    if (v.fecha) {
      const d = new Date(v.fecha);
      // Agrupar por fecha local (YYYY-MM-DD)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      acc[key] = (acc[key] || 0) + (Number(v.total) || 0);
    }
    return acc;
  }, {} as Record<string, number>);

  // Asegurar que el día de hoy aparezca aunque no haya ventas
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  if (!(todayKey in ventasPorDia)) {
    ventasPorDia[todayKey] = 0;
  }

  // Ordenar fechas y mostrar en formato local
  const sortedKeys = Object.keys(ventasPorDia).sort();
  const labelsVentas = sortedKeys.map(l => {
    const [year, month, day] = l.split('-');
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString();
  });
  const valuesVentas = sortedKeys.map(l => ventasPorDia[l]);
  const dataVentas = {
    labels: labelsVentas,
    datasets: [
      {
        label: 'Ventas',
        data: valuesVentas,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.12)',
        tension: 0.3,
        pointRadius: 3,
        fill: true,
      },
    ],
  };

  // Top empleados (barra horizontal)
  function sumByKey(arr: Venta[], keyFn: (v: Venta) => string) {
    return arr.reduce((acc, item) => {
      const k = keyFn(item);
      acc[k] = (acc[k] || 0) + (Number(item.total) || 0);
      return acc;
    }, {} as Record<string, number>);
  }
  function toSortedArray(obj: Record<string, number>, topN = 10) {
    return Object.entries(obj).map(([k, v]) => ({ key: k, value: v })).sort((a, b) => b.value - a.value).slice(0, topN);
  }
  const byEmp = sumByKey(filteredVentas, v => (v as any).empleado?.nombre || 'Desconocido');
  const topEmp = toSortedArray(byEmp);
  const dataEmpleados = {
    labels: topEmp.map(x => x.key),
    datasets: [
      {
        label: 'Ventas',
        data: topEmp.map(x => x.value),
        backgroundColor: '#10b981',
      },
    ],
  };

  // Top clientes (barra horizontal)
  const byCli = sumByKey(filteredVentas, v => (v as any).cliente?.nombre || 'Desconocido');
  const topCli = toSortedArray(byCli);
  const dataClientes = {
    labels: topCli.map(x => x.key),
    datasets: [
      {
        label: 'Ventas',
        data: topCli.map(x => x.value),
        backgroundColor: '#f59e0b',
      },
    ],
  };

  // Ventas por sucursal (pie)
  const bySuc = sumByKey(filteredVentas, v => v.sucursal?.nombre || 'Desconocido');
  const topSuc = toSortedArray(bySuc, 10);
  const dataSucursales = {
    labels: topSuc.map(x => x.key),
    datasets: [
      {
        label: 'Ventas',
        data: topSuc.map(x => x.value),
        backgroundColor: ['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#6366f1', '#f472b6', '#22d3ee', '#a3e635', '#facc15'],
      },
    ],
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="fw-bold text-dark">📊 Panel de Administración</h1>
            <p className="text-muted">Cargando datos...</p>
          </div>
        </div>
      </div>
    );
  }

  // Verificación de acceso: Sólo ADMIN puede ver este panel
  if (role !== "ADMIN") {
    return (
      <div className="container-fluid">
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="fw-bold text-dark">📊 Panel de Administración</h1>
            <Alert variant="danger">⛔ Acceso denegado. Este panel es sólo para administradores.</Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="fw-bold text-dark">📊 Panel de Administración</h1>
          <p className="text-muted">
            Bienvenido al sistema de gestión de ventas. Aquí puedes ver un
            resumen general de la actividad de tu negocio.
          </p>
          {error && <div className="alert alert-warning">{error}</div>}
        </div>
      </div>

      {/* Filtros arriba del dashboard */}
      <div className="row mb-4 justify-content-center">
        <div className="col-lg-8">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h5 className="card-title">Filtros</h5>
              <div className="row">
                <div className="col-md-4">
                  <Form.Group controlId="sucursalSelect">
                    <Form.Label>Sucursal</Form.Label>
                    <Form.Select
                      value={selectedSucursal}
                      onChange={(e) => setSelectedSucursal(e.target.value)}
                    >
                      <option value="">Todas las sucursales</option>
                      {sucursales.map((sucursal) => (
                        <option key={sucursal.id} value={sucursal.id}>
                          {sucursal.nombre}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className="col-md-4">
                  <Form.Group controlId="startDatePicker">
                    <Form.Label>Fecha inicio</Form.Label>
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      className="form-control"
                      placeholderText="Selecciona una fecha"
                    />
                  </Form.Group>
                </div>
                <div className="col-md-4">
                  <Form.Group controlId="endDatePicker">
                    <Form.Label>Fecha fin</Form.Label>
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      className="form-control"
                      placeholderText="Selecciona una fecha"
                    />
                  </Form.Group>
                </div>
              </div>
              <div className="row mt-3">
                <div className="col text-end">
                  <Button variant="primary" onClick={handleSearch}>
                    Buscar
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
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
              <h5 className="card-title text-dark">📦 Ventas registradas</h5>
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
      <div className="row mt-5 mb-4">
        <div className="col-lg-8 mb-3">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h5 className="card-title">📈 Resumen de ventas</h5>
              <p className="text-muted">
                Total de {productosVendidos} transacciones registradas por un monto de ${ventasTotales.toFixed(2)}
              </p>
            </Card.Body>
          </Card>
        </div>

        <div className="col-lg-4 mb-3">
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

      {/* Gráficas tipo dashboard JS */}
      <div className="row">
        <div className="col-lg-6">
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <h5 className="card-title">📈 Ventas (serie temporal)</h5>
              <div style={{ height: "300px" }}>
                <Bar
                  data={dataVentas}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: true },
                      tooltip: {
                        callbacks: {
                          label: ctx => `$${ctx.parsed.y}`
                        }
                      }
                    },
                    scales: {
                      y: {
                        ticks: {
                          callback: v => `$${v}`
                        }
                      }
                    }
                  }}
                />
              </div>
            </Card.Body>
          </Card>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <h5 className="card-title">🏅 Top Empleados</h5>
              <div style={{ height: "300px" }}>
                <Bar
                  data={dataEmpleados}
                  options={{
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: ctx => `$${ctx.parsed.x ?? ctx.parsed.y}`
                        }
                      }
                    },
                    scales: {
                      x: {
                        ticks: {
                          callback: v => `$${v}`
                        }
                      }
                    }
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-lg-6">
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <h5 className="card-title">👑 Top Clientes</h5>
              <div style={{ height: "300px" }}>
                <Bar
                  data={dataClientes}
                  options={{
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: ctx => `$${ctx.parsed.x ?? ctx.parsed.y}`
                        }
                      }
                    },
                    scales: {
                      x: {
                        ticks: {
                          callback: v => `$${v}`
                        }
                      }
                    }
                  }}
                />
              </div>
            </Card.Body>
          </Card>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <h5 className="card-title">🏬 Ventas por Sucursal</h5>
              <div style={{ height: "300px" }}>
                <Pie
                  data={dataSucursales}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: ctx => `${ctx.label}: $${ctx.parsed}`
                        }
                      }
                    }
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Administracion;
