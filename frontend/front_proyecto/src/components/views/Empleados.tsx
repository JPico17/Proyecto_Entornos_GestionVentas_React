import React, { useEffect, useState } from "react";
import { Card, Table, Alert, Button, Modal, Form } from "react-bootstrap";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Empleado {
  id: string;
  nombre: string;
  usuario: string;
  cargo: string;
  salario: number;
  email: string;
  role: "ADMIN" | "EMPLOYEE";
  sucursalId?: string | null;
  sucursalNombre?: string | null;
}

interface Sucursal {
  id: string;
  nombre: string;
}

const Empleados: React.FC = () => {
  const API_BASE_URL = "http://localhost:9090/api";
  const storedRole = localStorage.getItem("role");
  const role = storedRole ? (storedRole.toUpperCase() === "ADMIN" ? "ADMIN" : storedRole.toLowerCase()) : null;

  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal/form state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    usuario: "",
    cargo: "",
    salario: "0",
    email: "",
    password: "",
    role: "EMPLOYEE" as "ADMIN" | "EMPLOYEE",
    sucursalId: "",
  });
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [empRes, sucRes] = await Promise.all([
        fetch(`${API_BASE_URL}/empleados`),
        fetch(`${API_BASE_URL}/sucursales`),
      ]);

      if (!empRes.ok) throw new Error(`Error empleados: ${empRes.status}`);
      if (!sucRes.ok) throw new Error(`Error sucursales: ${sucRes.status}`);

      const empData: Empleado[] = await empRes.json();
      const sucData: Sucursal[] = await sucRes.json();

      setEmpleados(empData);
      setSucursales(sucData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (emp?: Empleado) => {
    if (emp) {
      setEditingId(emp.id);
      setFormData({
        nombre: emp.nombre || "",
        usuario: emp.usuario || "",
        cargo: emp.cargo || "",
        salario: String(emp.salario || 0),
        email: emp.email || "",
        password: "",
        role: emp.role || "EMPLOYEE",
        sucursalId: emp.sucursalId || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        nombre: "",
        usuario: "",
        cargo: "",
        salario: "0",
        email: "",
        password: "",
        role: "EMPLOYEE",
        sucursalId: "",
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
        nombre: formData.nombre,
        usuario: formData.usuario,
        cargo: formData.cargo,
        salario: parseFloat(formData.salario) || 0,
        email: formData.email,
        password: formData.password || undefined,
        role: formData.role,
        sucursalId: formData.role === "EMPLOYEE" ? formData.sucursalId : null,
      };

      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${API_BASE_URL}/empleados/${editingId}` : `${API_BASE_URL}/empleados`;

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
      setError(err instanceof Error ? err.message : "Error al guardar empleado");
      console.error("Error guardar empleado:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar este empleado?")) return;
    try {
      setError(null);
      const res = await fetch(`${API_BASE_URL}/empleados/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
      console.error("Error eliminar:", err);
    }
  };

  // Solo admin puede acceder
  if (role !== "ADMIN" && role !== "admin") {
    return (
      <div className="container-fluid">
        <Alert variant="danger">
          ⛔ Acceso denegado. Solo administradores pueden gestionar empleados.
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="fw-bold text-primary">👥 Empleados</h1>
            <p className="text-muted">Cargando empleados...</p>
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
            <h1 className="fw-bold text-primary">👥 Empleados</h1>
            <p className="text-muted">Gestiona todos los empleados del sistema.</p>
          </div>
          <Button variant="success" onClick={() => handleShowModal()} className="d-flex align-items-center gap-2">
            <Plus size={18} /> Nuevo Empleado
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="row">
        <div className="col-12">
          <Card className="shadow-sm border-0">
            <Card.Body>
              {empleados.length > 0 ? (
                <Table responsive hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Nombre</th>
                      <th>Usuario</th>
                      <th>Email</th>
                      <th>Cargo</th>
                      <th>Rol</th>
                      <th>Sucursal</th>
                      <th>Salario</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empleados.map((emp) => (
                      <tr key={emp.id}>
                        <td className="fw-bold">{emp.nombre}</td>
                        <td>{emp.usuario}</td>
                        <td>{emp.email}</td>
                        <td>{emp.cargo}</td>
                        <td>
                          <span className={`badge ${emp.role === "ADMIN" ? "bg-danger" : "bg-info"}`}>
                            {emp.role}
                          </span>
                        </td>
                        <td>{emp.sucursalNombre || "—"}</td>
                        <td>${(emp.salario || 0).toLocaleString()}</td>
                        <td className="text-center">
                          <Button variant="primary" size="sm" className="me-2" onClick={() => handleShowModal(emp)}>
                            <Edit size={14} />
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleDelete(emp.id)}>
                            <Trash2 size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted text-center py-5">No hay empleados registrados.</p>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Modal crear/editar */}
      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? "✏️ Editar Empleado" : "➕ Nuevo Empleado"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre *</Form.Label>
              <Form.Control name="nombre" value={formData.nombre} onChange={handleInputChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Usuario *</Form.Label>
              <Form.Control name="usuario" value={formData.usuario} onChange={handleInputChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control name="email" type="email" value={formData.email} onChange={handleInputChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Cargo *</Form.Label>
              <Form.Control name="cargo" value={formData.cargo} onChange={handleInputChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Salario</Form.Label>
              <Form.Control name="salario" type="number" step="0.01" value={formData.salario} onChange={handleInputChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contraseña {editingId ? "(dejar vacío para no cambiar)" : "*"}</Form.Label>
              <Form.Control name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder={editingId ? "No requerido" : "Contraseña"} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Rol *</Form.Label>
              <Form.Select name="role" value={formData.role} onChange={handleInputChange}>
                <option value="ADMIN">Admin</option>
                <option value="EMPLOYEE">Empleado</option>
              </Form.Select>
            </Form.Group>

            {formData.role === "EMPLOYEE" && (
              <Form.Group className="mb-3">
                <Form.Label>Sucursal (obligatoria para empleados) *</Form.Label>
                <Form.Select name="sucursalId" value={formData.sucursalId} onChange={handleInputChange}>
                  <option value="">-- Selecciona una sucursal --</option>
                  {sucursales.map((s) => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!formData.nombre.trim() || !formData.usuario.trim() || !formData.email.trim() || (formData.role === "EMPLOYEE" && !formData.sucursalId) || saving}
          >
            {editingId ? "Actualizar" : "Crear"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Empleados;
