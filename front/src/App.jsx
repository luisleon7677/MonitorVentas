import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp,
  PlusCircle,
  BarChart3,
  PieChart as PieChartIcon,
  ShoppingBag,
  Clock,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  XCircle,
  Save
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

const COLORS = ['#e61919', '#ff4d4d', '#990000', '#cc0000', '#ff8080'];
const API_URL = 'http://localhost:5000/api';
const DEFAULT_LIMIT = 5;

export default function App() {
  const [sales, setSales] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, limit: DEFAULT_LIMIT, total: 0 });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    codigo: '',
    precio: '',
    red_social: 'facebook'
  });

  const fetchSales = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/sales?page=${page}&limit=${DEFAULT_LIMIT}`);
      const result = await response.json();
      setSales(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const totalSales = pagination.total;
  const totalRevenue = useMemo(() => {
    return sales.reduce((acc, curr) => acc + curr.precio, 0);
  }, [sales]);

  const sourceStats = useMemo(() => {
    const counts = {};
    sales.forEach(s => counts[s.red_social] = (counts[s.red_social] || 0) + 1);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [sales]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.codigo || !formData.precio) return;

    try {
      const url = isEditing ? `${API_URL}/sales/${editId}` : `${API_URL}/sales`;
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          precio: parseFloat(formData.precio)
        })
      });

      if (response.ok) {
        resetForm();
        fetchSales(isEditing ? pagination.page : 1);
      }
    } catch (error) {
      console.error('Error saving sale:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este registro?')) return;

    try {
      const response = await fetch(`${API_URL}/sales/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // If we delete the last item on the page, go back one page
        const newPage = (sales.length === 1 && pagination.page > 1)
          ? pagination.page - 1
          : pagination.page;
        fetchSales(newPage);
      }
    } catch (error) {
      console.error('Error deleting sale:', error);
    }
  };

  const startEdit = (sale) => {
    setIsEditing(true);
    setEditId(sale.id);
    setFormData({
      codigo: sale.codigo,
      precio: sale.precio.toString(),
      red_social: sale.red_social
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({ codigo: '', precio: '', red_social: 'facebook' });
    setIsEditing(false);
    setEditId(null);
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="flex justify-between items-center gap-4" style={{ marginBottom: '40px' }}>
        <div>
          <h1 className="header-title">
            <span className="text-red">SALES</span>MONITOR
          </h1>
          <p className="text-muted">Real-time performance dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass revenue-badge">
            <span className="label-tiny">Page Revenue</span>
            <div style={{ fontSize: '24px', fontWeight: '900', fontFamily: 'monospace' }}>
              S/.{totalRevenue.toLocaleString()}
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Registration Form */}
        <section className="lg-col-span-4 flex flex-col gap-6">
          <div className="glass card-red-glow">
            <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
              <div className="flex items-center gap-2">
                {isEditing ? <Edit2 className="text-red" size={20} /> : <PlusCircle className="text-red" size={20} />}
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                  {isEditing ? 'Editar Venta' : 'Registrar Venta'}
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
                <label className="label-tiny">Código</label>
                <input
                  type="text"
                  placeholder="Ej: PROD-001"
                  value={formData.codigo}
                  onChange={e => setFormData({ ...formData, codigo: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="label-tiny">Precio</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.precio}
                  onChange={e => setFormData({ ...formData, precio: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="label-tiny">Red Social</label>
                <select value={formData.red_social} onChange={e => setFormData({ ...formData, red_social: e.target.value })}>
                  <option value="facebook">Facebook</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="otros">Otros</option>
                </select>
              </div>

              <button type="submit" className="btn-primary">
                {isEditing ? <span className="flex items-center justify-center gap-2"><Save size={18} /> ACTUALIZAR VENTA</span> : 'REGISTRAR VENTA'}
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
                <ShoppingBag size={24} />
              </div>
              <div>
                <p className="label-tiny">Total Ventas (Global)</p>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalSales}</h3>
              </div>
            </div>
            <TrendingUp color="#10b981" />
          </div>
        </section>

        {/* Dashboard Main Area */}
        <section className="lg-col-span-8 flex flex-col gap-8">
          <div className="glass card-red-glow">
            <div className="flex items-center gap-2" style={{ marginBottom: '24px' }}>
              <TrendingUp className="text-red" size={18} />
              <h3 style={{ fontWeight: 'bold' }}>Historial de Ventas</h3>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Código</th>
                    <th>Precio</th>
                    <th>Red Social</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Cargando...</td></tr>
                  ) : sales.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>No hay ventas registradas</td></tr>
                  ) : (
                    sales.map(sale => (
                      <tr key={sale.id} className={editId === sale.id ? 'editing' : ''}>
                        <td style={{ color: '#888', fontSize: '12px' }}>
                          {new Date(sale.fecha).toLocaleString()}
                        </td>
                        <td style={{ fontWeight: 'bold' }}>{sale.codigo}</td>
                        <td style={{ fontFamily: 'monospace' }}>S/.{sale.precio.toFixed(2)}</td>
                        <td>
                          <span className={`badge badge-${sale.red_social}`}>
                            {sale.red_social}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => startEdit(sale)}
                              className="btn-action edit"
                              title="Editar"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(sale.id)}
                              className="btn-action delete"
                              title="Eliminar"
                            >
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
                  onClick={() => fetchSales(pagination.page - 1)}
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
                <span className="page-info">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <button
                  className="btn-pagination"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchSales(pagination.page + 1)}
                >
                  Siguiente <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {sales.length > 0 && (
            <div className="glass card-red-glow">
              <div className="flex items-center gap-2" style={{ marginBottom: '24px' }}>
                <PieChartIcon className="text-red" size={18} />
                <h3 style={{ fontWeight: 'bold' }}>Distribución por Red Social (Página Actual)</h3>
              </div>
              <div style={{ height: '250px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sourceStats} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {sourceStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#121212', border: '1px solid #222', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
