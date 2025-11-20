import React, { useEffect, useState } from "react";
import { Card, Form, Button, Table, Alert, Badge, Row, Col, FloatingLabel } from "react-bootstrap";
import { Plus, Trash2 } from "lucide-react";

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
  sucursalId?: string;
  sucursalNombre?: string;
}

interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
}

interface CartItem {
  productoId: string;
  productoNombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}

const SalesForm: React.FC = () => {
  const API_BASE_URL = "http://localhost:9090/api";
  
  // Obtener datos del usuario desde localStorage
  const empleadoId = localStorage.getItem("empleadoId");
  const sucursalId = localStorage.getItem("sucursalId");
  
  // Estados
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedClienteId, setSelectedClienteId] = useState<string>("");
  const [selectedProductoId, setSelectedProductoId] = useState<string>("");
  const [cantidad, setCantidad] = useState<number>(1);
  const [carrito, setCarrito] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  // Cargar clientes y productos al montar
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener clientes y productos de la sucursal del empleado
      const [clientesRes, productosRes] = await Promise.all([
        fetch(`${API_BASE_URL}/clientes`),
        fetch(`${API_BASE_URL}/productos?sucursalId=${sucursalId}`),
      ]);

      if (!clientesRes.ok) throw new Error("Error al cargar clientes");
      if (!productosRes.ok) throw new Error("Error al cargar productos");

      const clientesData: Cliente[] = await clientesRes.json();
      const productosData: Producto[] = await productosRes.json();

      setClientes(clientesData);
      setProductos(productosData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarProducto = () => {
    if (!selectedProductoId || cantidad <= 0) {
      setError("Selecciona un producto y una cantidad válida");
      return;
    }

    const producto = productos.find((p) => p.id === selectedProductoId);
    if (!producto) {
      setError("Producto no encontrado");
      return;
    }

    if (cantidad > producto.stock) {
      setError(`Stock insuficiente. Disponible: ${producto.stock}`);
      return;
    }

    // Verificar si el producto ya está en el carrito
    const itemExistente = carrito.find((item) => item.productoId === selectedProductoId);
    if (itemExistente) {
      // Actualizar cantidad
      const nuevaCantidad = itemExistente.cantidad + cantidad;
      if (nuevaCantidad > producto.stock) {
        setError(`Stock insuficiente para esta cantidad. Disponible: ${producto.stock}`);
        return;
      }
      setCarrito(
        carrito.map((item) =>
          item.productoId === selectedProductoId
            ? {
                ...item,
                cantidad: nuevaCantidad,
                subtotal: producto.precio * nuevaCantidad,
              }
            : item
        )
      );
    } else {
      // Agregar nuevo item
      setCarrito([
        ...carrito,
        {
          productoId: selectedProductoId,
          productoNombre: producto.nombre,
          precio: producto.precio,
          cantidad,
          subtotal: producto.precio * cantidad,
        },
      ]);
    }

    setSelectedProductoId("");
    setCantidad(1);
    setError(null);
  };

  const handleEliminarDelCarrito = (productoId: string) => {
    setCarrito(carrito.filter((item) => item.productoId !== productoId));
  };

  const handleRegistrarVenta = async () => {
    if (!selectedClienteId) {
      setError("Selecciona un cliente");
      return;
    }

    if (carrito.length === 0) {
      setError("El carrito está vacío");
      return;
    }

    if (!empleadoId || !sucursalId) {
      setError("Error: Datos de sesión incompletos. Intenta cerrar sesión y volver a iniciar.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const ventaDTO = {
        clienteId: selectedClienteId,
        empleadoId,
        sucursalId,
        items: carrito.map((item) => ({
          productoId: item.productoId,
          cantidad: item.cantidad,
        })),
      };

      console.log("Enviando venta:", ventaDTO);

      const response = await fetch(`${API_BASE_URL}/ventas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ventaDTO),
      });

      if (!response.ok) {
        let errorMessage = "Error al registrar venta";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = "Error al registrar venta. Verifica los datos.";
        }
        throw new Error(errorMessage);
      }

      setSuccess("✅ Venta registrada exitosamente");
      setCarrito([]);
      setSelectedClienteId("");
      setTimeout(() => setSuccess(null), 3000);
      
      // Recargar productos para actualizar stock
      fetchData();
    } catch (err: any) {
      setError(err.message);
      console.error("Error registrando venta:", err);
    } finally {
      setSaving(false);
    }
  };

  const total = carrito.reduce((sum, item) => sum + item.subtotal, 0);

  if (loading) {
    return (
      <div className="container-fluid mt-4">
        <Alert variant="info">Cargando...</Alert>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="fw-bold text-primary">💳 Registrar Nueva Venta</h1>
          <p className="text-muted">Selecciona un cliente y agrega productos al carrito</p>
        </div>
      </div>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

      <div className="row gap-4">
        {/* Formulario de venta */}
        <div className="col-lg-8">
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-light">
              <h5 className="mb-0">📋 Detalles de la Venta</h5>
            </Card.Header>
            <Card.Body>
              {/* Selección de cliente */}
              <div className="mb-4">
                <FloatingLabel controlId="clienteSelect" label="Seleccionar cliente">
                  <Form.Select
                    value={selectedClienteId}
                    onChange={(e) => setSelectedClienteId(e.target.value)}
                    disabled={saving}
                  >
                    <option value="">-- Elige un cliente --</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre} ({cliente.email})
                      </option>
                    ))}
                  </Form.Select>
                </FloatingLabel>
              </div>

              {/* Agregar productos */}
              <div className="border-bottom pb-4 mb-4">
                <h6 className="fw-bold mb-3">🛒 Agregar Productos</h6>
                <Row className="g-2 mb-3">
                  <Col md={6}>
                    <FloatingLabel controlId="productoSelect" label="Producto">
                      <Form.Select
                        value={selectedProductoId}
                        onChange={(e) => setSelectedProductoId(e.target.value)}
                        disabled={saving}
                      >
                        <option value="">-- Selecciona un producto --</option>
                        {productos.map((prod) => (
                          <option key={prod.id} value={prod.id}>
                            {prod.nombre} - ${prod.precio.toFixed(2)} (Stock: {prod.stock})
                          </option>
                        ))}
                      </Form.Select>
                    </FloatingLabel>
                  </Col>
                  <Col md={3}>
                    <FloatingLabel controlId="cantidadInput" label="Cantidad">
                      <Form.Control
                        type="number"
                        min="1"
                        value={cantidad}
                        onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                        disabled={saving}
                      />
                    </FloatingLabel>
                  </Col>
                  <Col md={3} className="d-flex gap-2">
                    <Button
                      variant="success"
                      onClick={handleAgregarProducto}
                      disabled={saving || !selectedProductoId}
                      className="w-100 d-flex align-items-center justify-content-center gap-2"
                    >
                      <Plus size={18} /> Agregar
                    </Button>
                  </Col>
                </Row>
              </div>

              {/* Carrito */}
              {carrito.length > 0 ? (
                <div>
                  <h6 className="fw-bold mb-3">🛍️ Artículos en el Carrito</h6>
                  <Table striped bordered hover size="sm">
                    <thead className="table-light">
                      <tr>
                        <th>Producto</th>
                        <th className="text-end" style={{ width: "80px" }}>Precio</th>
                        <th className="text-center" style={{ width: "80px" }}>Cantidad</th>
                        <th className="text-end" style={{ width: "100px" }}>Subtotal</th>
                        <th className="text-center" style={{ width: "60px" }}>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {carrito.map((item) => (
                        <tr key={item.productoId}>
                          <td className="fw-bold">{item.productoNombre}</td>
                          <td className="text-end">${item.precio.toFixed(2)}</td>
                          <td className="text-center">
                            <Badge bg="primary">{item.cantidad}</Badge>
                          </td>
                          <td className="text-end">${item.subtotal.toFixed(2)}</td>
                          <td className="text-center">
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleEliminarDelCarrito(item.productoId)}
                              disabled={saving}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      <tr className="fw-bold bg-light">
                        <td colSpan={3} className="text-end">
                          TOTAL:
                        </td>
                        <td className="text-end text-success">
                          ${total.toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-5 text-muted">
                  <p>Agrega productos al carrito para continuar...</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Resumen y botón de registro */}
        <div className="col-lg-4">
          <Card className="shadow-sm border-0 sticky-top" style={{ top: "80px" }}>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">📊 Resumen de Venta</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span>Cliente:</span>
                  <strong>
                    {selectedClienteId
                      ? clientes.find((c) => c.id === selectedClienteId)?.nombre || "—"
                      : "No seleccionado"}
                  </strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Artículos:</span>
                  <strong>{carrito.length}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Cantidad total:</span>
                  <strong>{carrito.reduce((sum, item) => sum + item.cantidad, 0)}</strong>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <h6>Total:</h6>
                  <h5 className="text-success">${total.toFixed(2)}</h5>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-100 mb-2"
                onClick={handleRegistrarVenta}
                disabled={saving || !selectedClienteId || carrito.length === 0}
              >
                {saving ? "Procesando..." : "💾 Registrar Venta"}
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                className="w-100"
                onClick={() => {
                  setCarrito([]);
                  setSelectedClienteId("");
                  setError(null);
                }}
                disabled={saving}
              >
                Limpiar Formulario
              </Button>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SalesForm;
