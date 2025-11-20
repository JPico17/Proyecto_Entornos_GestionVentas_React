import React, { useEffect, useState } from "react";
import { Card, Table, Alert, Button, Modal, Form } from "react-bootstrap";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
}

const Clientes: React.FC = () => {
    const [search, setSearch] = useState("");
  const API_BASE_URL = "http://localhost:9090/api";

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal / form state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
  });

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE_URL}/clientes`);
      if (!res.ok) throw new Error(`Error clientes: ${res.status}`);

      const data: Cliente[] = await res.json();
      setClientes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      console.error("Error cargando clientes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (c?: Cliente) => {
    if (c) {
      setEditingId(c.id);
      setFormData({
        nombre: c.nombre,
        email: c.email,
        telefono: c.telefono,
      });
    } else {
      setEditingId(null);
      setFormData({
        nombre: "",
        email: "",
        telefono: "",
      });
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
        nombre: formData.nombre.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim(),
      };

      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${API_BASE_URL}/clientes/${editingId}`
        : `${API_BASE_URL}/clientes`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `HTTP ${res.status}`);
      }

      handleCloseModal();
      await fetchClientes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar cliente");
      console.error("Error guardar cliente:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar este cliente?")) return;

    try {
      setError(null);

      const res = await fetch(`${API_BASE_URL}/clientes/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      await fetchClientes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
      console.error("Error eliminar:", err);
    }
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="container-fluid">
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="fw-bold text-primary">👥 Clientes</h1>
            <p className="text-muted">Cargando clientes...</p>
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
            <h1 className="fw-bold text-primary">👥 Clientes</h1>
            <p className="text-muted">Listado de todos los clientes registrados.</p>
            <input
              type="text"
              className="form-control mt-2"
              placeholder="Buscar cliente por nombre..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ maxWidth: 300 }}
            />
          </div>

          <Button
            variant="success"
            onClick={() => handleShowModal()}
            className="d-flex align-items-center gap-2"
          >
            <Plus size={18} /> Nuevo Cliente
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm border-0">
        <Card.Body>
          {clientes.length > 0 ? (
            <Table hover responsive className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes
                  .filter(c => c.nombre.toLowerCase().includes(search.toLowerCase()))
                  .map((c) => (
                    <tr key={c.id}>
                      <td className="fw-bold">{c.nombre}</td>
                      <td>{c.email}</td>
                      <td>{c.telefono}</td>
                      <td className="text-center">
                        <Button
                          size="sm"
                          variant="primary"
                          className="me-2"
                          onClick={() => handleShowModal(c)}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(c.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-muted text-center py-4">
              No hay clientes registrados.
            </p>
          )}
        </Card.Body>
      </Card>

      {/* Modal Crear/Editar */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingId ? "✏️ Editar Cliente" : "➕ Nuevo Cliente"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre *</Form.Label>
              <Form.Control
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Teléfono *</Form.Label>
              <Form.Control
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
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
            disabled={
              !formData.nombre.trim() ||
              !formData.email.trim() ||
              !formData.telefono.trim() ||
              saving
            }
            onClick={handleSave}
          >
            {editingId ? "Actualizar" : "Crear"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Clientes;
