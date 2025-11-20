import React, { useEffect, useState } from "react";
import { Card, Table, Alert, Button, Modal, Form } from "react-bootstrap";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
  sucursalId?: string | null;
  sucursalNombre?: string | null;
}

interface Sucursal {
  id: string;
  nombre: string;
}

const Productos: React.FC = () => {
    const [search, setSearch] = useState("");
  const API_BASE_URL = "http://localhost:9090/api";
  const [productos, setProductos] = useState<Producto[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const storedRole = localStorage.getItem("role");
  const role = storedRole?.toUpperCase() ?? null; // Normalizar a ADMIN | EMPLOYEE
  const sucursalId = localStorage.getItem("sucursalId"); // Para empleados
  const nombreSucursal = localStorage.getItem("sucursalNombre") || "Tu sucursal";

  // Modal/form state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ nombre: "", precio: "0", stock: "0", sucursalId: "" });
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Empleado: obtener productos solo de su sucursal
      const prodUrl = role === "EMPLOYEE" && sucursalId 
        ? `${API_BASE_URL}/productos?sucursalId=${sucursalId}`
        : `${API_BASE_URL}/productos`;
      
      const [prodRes, sucRes] = await Promise.all([
        fetch(prodUrl),
        fetch(`${API_BASE_URL}/sucursales`),
      ]);

      if (!prodRes.ok) throw new Error(`Error productos: ${prodRes.status}`);
      if (!sucRes.ok) throw new Error(`Error sucursales: ${sucRes.status}`);

      const prodData: Producto[] = await prodRes.json();
      const sucData: Sucursal[] = await sucRes.json();

      setProductos(prodData);
      setSucursales(sucData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (p?: Producto) => {
    if (p) {
      setEditingId(p.id);
      setFormData({ nombre: p.nombre || "", precio: String(p.precio || 0), stock: String(p.stock || 0), sucursalId: p.sucursalId || "" });
    } else {
      setEditingId(null);
      setFormData({ nombre: "", precio: "0", stock: "0", sucursalId: "" });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleInputChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const payload = {
        nombre: formData.nombre,
        precio: parseFloat(formData.precio) || 0,
        stock: parseInt(formData.stock) || 0,
        sucursalId: formData.sucursalId || null,
      };

      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${API_BASE_URL}/productos/${editingId}` : `${API_BASE_URL}/productos`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      handleCloseModal();
      await fetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar producto");
      console.error("Error guardar producto:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    try {
      setError(null);
      const res = await fetch(`${API_BASE_URL}/productos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
      console.error("Error eliminar:", err);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="fw-bold text-primary">📦 Productos</h1>
            <p className="text-muted">Cargando productos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <div>
            <h1 className="fw-bold text-primary">📦 Productos</h1>
            <p className="text-muted">
              {role === "EMPLOYEE" 
                ? `Productos disponibles en tu sucursal` 
                : "Listado de todos los productos disponibles en el sistema."}
            </p>
            <input
              type="text"
              className="form-control mt-2"
              placeholder="Buscar producto por nombre..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ maxWidth: 300 }}
            />
          </div>
          {(role === "ADMIN") && (
            <Button variant="success" onClick={() => handleShowModal()} className="d-flex align-items-center gap-2">
              <Plus size={18} /> Nuevo Producto
            </Button>
          )}
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="row">
        <div className="col-12">
          <Card className="shadow-sm border-0">
            <Card.Body>
              {productos.length > 0 ? (
                <Table responsive hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Nombre</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>Sucursal</th>
                      {(role === "ADMIN" || role === "admin") && <th className="text-center">Acciones</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {productos
                      .filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()))
                      .map((p) => (
                        <tr key={p.id}>
                          <td className="fw-bold">{p.nombre}</td>
                          <td>${p.precio?.toFixed(2) ?? "0.00"}</td>
                          <td>{p.stock ?? 0}</td>
                          <td>{p.sucursalNombre ?? "—"}</td>
                          <td className="text-center">
                            { (role === "ADMIN") && (
                              <>
                                <Button variant="primary" size="sm" className="me-2" onClick={() => handleShowModal(p)}>
                                  <Edit size={14} />
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => handleDelete(p.id)}>
                                  <Trash2 size={14} />
                                </Button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted text-center py-5">No hay productos registrados.</p>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Modal crear/editar */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? "✏️ Editar Producto" : "➕ Nuevo Producto"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre *</Form.Label>
              <Form.Control name="nombre" value={formData.nombre} onChange={handleInputChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Precio *</Form.Label>
              <Form.Control name="precio" type="number" step="0.01" value={formData.precio} onChange={handleInputChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Stock *</Form.Label>
              <Form.Control name="stock" type="number" value={formData.stock} onChange={handleInputChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Sucursal (opcional)</Form.Label>
              <Form.Select name="sucursalId" value={formData.sucursalId} onChange={handleInputChange}>
                <option value="">-- Ninguna --</option>
                {sucursales.map((s) => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} disabled={!formData.nombre.trim() || !formData.sucursalId || saving}>{editingId ? "Actualizar" : "Crear"}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Productos;
