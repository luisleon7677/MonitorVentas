import React, { useState, useEffect } from 'react';
import {
  Users,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  XCircle,
  Save,
  MapPin,
  TrendingUp
} from 'lucide-react';

const DEPARTAMENTOS_PERU = [
  "Amazonas", "Ancash", "Apurímac", "Arequipa", "Ayacucho",
  "Cajamarca", "Callao", "Cusco", "Huancavelica", "Huánuco",
  "Ica", "Junín", "La Libertad", "Lambayeque", "Lima",
  "Loreto", "Madre de Dios", "Moquegua", "Pasco", "Piura",
  "Puno", "San Martín", "Tacna", "Tumbes", "Ucayali"
];

const API_URL = window.location.origin.includes('localhost') ? 'http://localhost:5000/api' : '/api';
const DEFAULT_LIMIT = 5;

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, limit: DEFAULT_LIMIT, total: 0 });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    departamento: '',
    cantidad_ventas: '0'
  });

  const fetchClients = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/clients?page=${page}&limit=${DEFAULT_LIMIT}`);
      const result = await response.json();
      setClients(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.departamento) return;

    try {
      const url = isEditing ? `${API_URL}/clients/${editId}` : `${API_URL}/clients`;
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          cantidad_ventas: parseInt(formData.cantidad_ventas) || 0
        })
      });

      if (response.ok) {
        resetForm();
        fetchClients(isEditing ? pagination.page : 1);
      }
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este cliente?')) return;

    try {
      const response = await fetch(`${API_URL}/clients/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const newPage = (clients.length === 1 && pagination.page > 1)
          ? pagination.page - 1
          : pagination.page;
        fetchClients(newPage);
      }
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const startEdit = (client) => {
    setIsEditing(true);
    setEditId(client.id);
    setFormData({
      nombre: client.nombre,
      departamento: client.departamento,
      cantidad_ventas: client.cantidad_ventas.toString()
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({ nombre: '', departamento: '', cantidad_ventas: '0' });
    setIsEditing(false);
    setEditId(null);
  };

  return (
    <div className="container">
      <header className="flex justify-between items-center gap-4" style={{ marginBottom: '60px' }}>
        <div>
          <h1 className="header-title">
            <span className="text-red">CLIENT</span>MANAGER
          </h1>
          <p className="text-muted">Gestión de cartera de clientes</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass revenue-badge">
            <span className="label-tiny">Total Clientes</span>
            <div style={{ fontSize: '24px', fontWeight: '900', fontFamily: 'monospace' }}>
              {pagination.total}
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        <section className="lg-col-span-4 flex flex-col gap-6">
          <div className="glass card-red-glow">
            <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
              <div className="flex items-center gap-2">
                {isEditing ? <Edit2 className="text-red" size={20} /> : <PlusCircle className="text-red" size={20} />}
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                  {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
                </h2>
              </div>
              {isEditing && (
                <button onClick={resetForm} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}>
                  <XCircle size={20} />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="form-group">
                <label className="label-tiny">Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  value={formData.nombre}
                  onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="label-tiny">Departamento</label>
                <select
                  value={formData.departamento}
                  onChange={e => setFormData({ ...formData, departamento: e.target.value })}
                  required
                >
                  <option value="" disabled>Selecciona un departamento</option>
                  {DEPARTAMENTOS_PERU.map(dep => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label-tiny">Cantidad de Ventas</label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.cantidad_ventas}
                  onChange={e => setFormData({ ...formData, cantidad_ventas: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-primary">
                {isEditing ? <span className="flex items-center justify-center gap-2"><Save size={18} /> ACTUALIZAR CLIENTE</span> : 'REGISTRAR CLIENTE'}
              </button>
              {isEditing && (
                <button type="button" onClick={resetForm} className="btn-pagination" style={{ width: '100%', marginTop: '0' }}>
                  CANCELAR
                </button>
              )}
            </form>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="icon-box">
                <MapPin size={24} />
              </div>
              <div>
                <p className="label-tiny">Cobertura</p>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Nacional</h3>
              </div>
            </div>
            <TrendingUp color="#10b981" />
          </div>
        </section>

        <section className="lg-col-span-8 flex flex-col gap-8">
          <div className="glass card-red-glow">
            <div className="flex items-center gap-2" style={{ marginBottom: '24px' }}>
              <Users className="text-red" size={18} />
              <h3 style={{ fontWeight: 'bold' }}>Lista de Clientes</h3>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Departamento</th>
                    <th>Ventas</th>
                    <th>Registro</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Cargando...</td></tr>
                  ) : clients.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>No hay clientes registrados</td></tr>
                  ) : (
                    clients.map(client => (
                      <tr key={client.id} className={editId === client.id ? 'editing' : ''}>
                        <td style={{ fontWeight: 'bold' }}>{client.nombre}</td>
                        <td>{client.departamento}</td>
                        <td style={{ fontFamily: 'monospace' }}>{client.cantidad_ventas}</td>
                        <td style={{ color: '#888', fontSize: '12px' }}>
                          {new Date(client.fecha_registro).toLocaleDateString()}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="flex justify-end gap-2">
                            <button onClick={() => startEdit(client)} className="btn-action edit" title="Editar">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDelete(client.id)} className="btn-action delete" title="Eliminar">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn-pagination"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchClients(pagination.page - 1)}
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
                <span className="page-info">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <button
                  className="btn-pagination"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchClients(pagination.page + 1)}
                >
                  Siguiente <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
