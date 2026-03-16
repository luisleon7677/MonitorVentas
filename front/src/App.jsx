import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  PlusCircle, 
  BarChart3, 
  PieChart as PieChartIcon, 
  ShoppingBag,
  Clock
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
import { initialSalesData, sources, campaigns, products } from './mockData';

const COLORS = ['#e61919', '#ff4d4d', '#990000', '#cc0000', '#ff8080'];

export default function App() {
  const [sales, setSales] = useState(initialSalesData);
  const [formData, setFormData] = useState({
    campaign: campaigns[0],
    product: products[0],
    price: '',
    source: sources[0]
  });

  const totalSales = sales.length;
  const totalRevenue = sales.reduce((acc, curr) => acc + curr.price, 0);
  
  const sourceStats = useMemo(() => {
    const counts = {};
    sales.forEach(s => counts[s.source] = (counts[s.source] || 0) + 1);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [sales]);

  const campaignStats = useMemo(() => {
    const counts = {};
    sales.forEach(s => counts[s.campaign] = (counts[s.campaign] || 0) + 1);
    return Object.entries(counts).map(([name, sales]) => ({ name, sales }));
  }, [sales]);

  const timelineData = useMemo(() => {
    const dates = {};
    sales.forEach(s => dates[s.date] = (dates[s.date] || 0) + 1);
    return Object.entries(dates)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, count]) => ({ date, count }));
  }, [sales]);

  const handleRegister = (e) => {
    e.preventDefault();
    if (!formData.price) return;
    const newSale = {
      ...formData,
      id: Date.now(),
      price: parseFloat(formData.price),
      date: new Date().toISOString().split('T')[0]
    };
    setSales([...sales, newSale]);
    setFormData({ ...formData, price: '' });
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
            <span className="label-tiny">Total Revenue</span>
            <div style={{ fontSize: '24px', fontWeight: '900', fontFamily: 'monospace' }}>
              ${totalRevenue.toLocaleString()}
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Registration Form */}
        <section className="lg-col-span-4 flex flex-col gap-6">
          <div className="glass card-red-glow">
            <div className="flex items-center gap-2" style={{ marginBottom: '24px' }}>
              <PlusCircle className="text-red" size={20} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Registrar Venta</h2>
            </div>
            
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div className="form-group">
                <label className="label-tiny">Campaña</label>
                <select value={formData.campaign} onChange={e => setFormData({...formData, campaign: e.target.value})}>
                  {campaigns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="label-tiny">Producto</label>
                <select value={formData.product} onChange={e => setFormData({...formData, product: e.target.value})}>
                  {products.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="label-tiny">Precio</label>
                <input type="number" placeholder="0.00" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>

              <div className="form-group">
                <label className="label-tiny">Fuente</label>
                <select value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})}>
                  {sources.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <button type="submit" className="btn-primary">REGISTRAR VENTA</button>
            </form>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="icon-box">
                <ShoppingBag size={24} />
              </div>
              <div>
                <p className="label-tiny">Total Ventas</p>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalSales}</h3>
              </div>
            </div>
            <TrendingUp color="#10b981" />
          </div>
        </section>

        {/* Dashboard Main Area */}
        <section className="lg-col-span-8 flex flex-col gap-8">
          <div className="grid md-grid-cols-2 gap-8">
            <div className="glass card-red-glow">
              <div className="flex items-center gap-2" style={{ marginBottom: '24px' }}>
                <BarChart3 className="text-red" size={18} />
                <h3 style={{ fontWeight: 'bold' }}>Ventas por Campaña</h3>
              </div>
              <div style={{ height: '250px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={campaignStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: '#121212', border: '1px solid #222', borderRadius: '8px' }} />
                    <Bar dataKey="sales" fill="#e61919" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass card-red-glow">
              <div className="flex items-center gap-2" style={{ marginBottom: '24px' }}>
                <PieChartIcon className="text-red" size={18} />
                <h3 style={{ fontWeight: 'bold' }}>Distribución por Fuente</h3>
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
          </div>

          <div className="glass card-red-glow">
            <div className="flex items-center gap-2" style={{ marginBottom: '24px' }}>
              <Clock className="text-red" size={18} />
              <h3 style={{ fontWeight: 'bold' }}>Línea de Tiempo de Ventas</h3>
            </div>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e61919" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#e61919" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: '#121212', border: '1px solid #222', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="count" stroke="#e61919" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
