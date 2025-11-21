import React, { useEffect, useState } from "react";
import { Card, Button, Modal, Form, Table, Alert } from "react-bootstrap";
import { Plus, Edit, Trash2, MapPin } from "lucide-react";

interface Sucursal {
  id: string;
  nombre: string;
  direccion?: string;
  telefono?: string;
  ciudad?: string;
}

const Sucursales: React.FC = () => {
  const API_BASE_URL = "http://localhost:9090/api";
  const storedRole = localStorage.getItem("role");
  // Normalizar rol: aceptar ADMIN/EMPLOYEE (backend) o admin/empleado (frontend)
  const role = (() => {
    if (!storedRole) return null;
    const up = storedRole.toUpperCase();
    if (up === "ADMIN") return "ADMIN";
    if (up === "EMPLOYEE") return "EMPLOYEE";
    return storedRole;
  })();
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
  });

  // Cargar sucursales al montar el componente
  useEffect(() => {
    fetchSucursales();
  }, []);

  const fetchSucursales = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/sucursales`);
      if (!response.ok) throw new Error("Error al obtener sucursales");
      const data: Sucursal[] = await response.json();
      setSucursales(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      console.error("Error al cargar sucursales:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (sucursal?: Sucursal) => {
    if (sucursal) {
      setEditingId(sucursal.id);
      setFormData({
        nombre: sucursal.nombre,
        direccion: sucursal.direccion || "",
        telefono: sucursal.telefono || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        nombre: "",
        direccion: "",
        telefono: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setError(null);
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${API_BASE_URL}/sucursales/${editingId}`
        : `${API_BASE_URL}/sucursales`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Error al guardar sucursal");

      handleCloseModal();
      fetchSucursales();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
      console.error("Error:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta sucursal?")) {
      return;
    }

    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/sucursales/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar sucursal");

      fetchSucursales();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
      console.error("Error:", err);
    }
  };

  // Solo admin puede acceder (acepta 'ADMIN' o el valor normalizado guardado en App)
  if (role !== "ADMIN" && role !== "admin") {
    return (
      <div className="container-fluid">
        <Alert variant="danger">
          ⛔ Acceso denegado. Solo administradores pueden gestionar sucursales.
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="fw-bold text-dark">🏬 Gestión de Sucursales</h1>
            <p className="text-muted">Cargando sucursales...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="fw-bold text-dark">🏬 Gestión de Sucursales</h1>
              <p className="text-muted">
                Administra las sucursales de tu negocio
              </p>
            </div>
            <Button
              variant="success"
              className="d-flex align-items-center gap-2"
              onClick={() => handleShowModal()}
            >
              <Plus size={20} /> Nueva Sucursal
            </Button>
          </div>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="row">
        <div className="col-12">
          <Card className="shadow-sm border-0">
            <Card.Body>
              {sucursales.length > 0 ? (
                <Table responsive hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>
                        <MapPin size={18} /> Nombre
                      </th>
                      <th>Dirección</th>
                      <th>Teléfono</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sucursales.map((sucursal) => (
                      <tr key={sucursal.id}>
                        <td className="fw-bold">{sucursal.nombre}</td>
                        <td>{sucursal.direccion || "—"}</td>
                        <td>{sucursal.telefono || "—"}</td>
                        <td className="text-center">
                          <Button
                            variant="primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleShowModal(sucursal)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(sucursal.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted text-center py-5">
                  No hay sucursales registradas. Crea la primera haciendo clic en "Nueva Sucursal".
                </p>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Modal para crear/editar */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingId ? "✏️ Editar Sucursal" : "➕ Nueva Sucursal"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre *</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej: Sucursal Centro"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                placeholder="Ej: Calle Principal 123"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                placeholder="Ej: 3156789012"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!formData.nombre.trim()}
          >
            {editingId ? "Actualizar" : "Crear"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Sucursales;
