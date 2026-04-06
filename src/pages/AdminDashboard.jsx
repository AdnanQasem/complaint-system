import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  FileStack, AlertTriangle, CheckCircle, Clock, TrendingUp,
  Users, ShieldCheck, Download, Eye, Zap
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Dashboard.css';

const COLORS = ['#1D70B8', '#F59E0B', '#EF4444', '#10B981', '#8B5CF6', '#64748B', '#EC4899'];

const severityLabel = (s) => {
  if (s >= 5) return { label: 'طارئ', cls: 'critical' };
  if (s >= 4) return { label: 'عاجل', cls: 'critical' };
  if (s >= 3) return { label: 'هام', cls: 'warning' };
  return { label: 'عادي', cls: 'success' };
};

const statusLabels = {
  PENDING: { label: 'قيد الانتظار', cls: 'warning' },
  IN_PROGRESS: { label: 'جارٍ المعالجة', cls: 'level-warning' },
  RESOLVED: { label: 'تم الحل', cls: 'success' },
  CLOSED: { label: 'مغلق', cls: 'level-normal' },
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch('http://127.0.0.1:8000/api/complaints/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { 
        setComplaints(Array.isArray(data) ? data : []); 
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  }, []);

  // ─── Statistics ───────────────────────────────────────────────
  const total       = complaints.length;
  const critical    = complaints.filter(c => c.ai_severity >= 4).length;
  const pending     = complaints.filter(c => c.status === 'PENDING').length;
  const inProgress  = complaints.filter(c => c.status === 'IN_PROGRESS').length;
  const resolved    = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
  const resolutionRate = total ? Math.round((resolved / total) * 100) : 0;

  // ─── Category Bar Chart ───────────────────────────────────────
  const catMap = complaints.reduce((acc, c) => {
    const key = c.ai_category || 'غير مصنف';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const catData = Object.entries(catMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // ─── Severity Pie ─────────────────────────────────────────────
  const severityMap = { 'منخفض (1-2)': 0, 'متوسط (3)': 0, 'حرج (4-5)': 0 };
  complaints.forEach(c => {
    if (c.ai_severity <= 2) severityMap['منخفض (1-2)']++;
    else if (c.ai_severity === 3) severityMap['متوسط (3)']++;
    else severityMap['حرج (4-5)']++;
  });
  const pieData = Object.entries(severityMap).map(([name, value]) => ({ name, value }));

  // ─── Weekly trend (last 6 days) ───────────────────────────────
  const days = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  const weeklyMap = {};
  complaints.forEach(c => {
    const d = new Date(c.created_at);
    const key = days[d.getDay()];
    weeklyMap[key] = (weeklyMap[key] || 0) + 1;
  });
  const weeklyData = days.map(name => ({ name, cases: weeklyMap[name] || 0 }));

  const recentComplaints = [...complaints].reverse().slice(0, 6);

  // ─── Excel/CSV Export ─────────────────────────────────────────
  const exportToCSV = () => {
    const headers = ['رقم الشكوى', 'اسم المشتكي', 'رقم الهوية', 'الهاتف', 'المنطقة', 'التصنيف (AI)', 'الخطورة', 'الحالة', 'تاريخ الإدخال'];
    const rows = complaints.map(c => [
      c.complaint_number,
      c.complainant_name,
      c.complainant_id_number,
      c.complainant_phone,
      c.region,
      c.ai_category || '—',
      c.ai_severity,
      c.status === 'PENDING' ? 'قيد الانتظار' : c.status === 'IN_PROGRESS' ? 'جارٍ المعالجة' : c.status === 'RESOLVED' ? 'تم الحل' : 'مغلق',
      new Date(c.created_at).toLocaleDateString('ar-EG')
    ]);
    const BOM = '\uFEFF'; // UTF-8 BOM for Arabic
    const csv = BOM + [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير_الشكاوى_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard-container">

      {/* ── Welcome Banner ─────────────────────────────────────── */}
      <div className="welcome-banner card" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1D70B8 100%)',
        color: 'white', alignItems: 'center'
      }}>
        <div>
          <h2 style={{ color: 'white', marginBottom: '8px' }}>
            مرحباً {user?.first_name || 'مدير المؤسسة'} 👋
          </h2>
          <p style={{ color: '#cbd5e1', margin: 0 }}>
            {loading
              ? 'جاري تحميل البيانات...'
              : `لديك ${total} شكوى مسجلة في النظام، منها ${critical} حالة حرجة تستوجب المتابعة الفورية.`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            className="btn-primary"
            style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => window.print()}
          >
            <Download size={18} /> طباعة / PDF
          </button>
          <button
            className="btn-primary"
            style={{ background: '#10B981', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={exportToCSV}
          >
            <Download size={18} /> تصدير Excel
          </button>
        </div>
      </div>

      {/* ── Stats Grid ─────────────────────────────────────────── */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>

        <div className="stat-card card">
          <div className="stat-icon" style={{ backgroundColor: '#EEF2FF', color: 'var(--primary-blue)' }}>
            <FileStack size={24} />
          </div>
          <div className="stat-content">
            <p>إجمالي الشكاوى الواردة</p>
            <h3>{loading ? '-' : total}</h3>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon" style={{ backgroundColor: '#FEF2F2', color: 'var(--status-critical)' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <p>حالات حرجة وعاجلة (4-5)</p>
            <h3>{loading ? '-' : critical}</h3>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon" style={{ backgroundColor: '#FFFBEB', color: 'var(--status-warning)' }}>
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <p>قيد الانتظار (لم تُحل)</p>
            <h3>{loading ? '-' : pending}</h3>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon" style={{ backgroundColor: '#F0F9FF', color: '#0ea5e9' }}>
            <Zap size={24} />
          </div>
          <div className="stat-content">
            <p>جارٍ المعالجة الآن</p>
            <h3>{loading ? '-' : inProgress}</h3>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon" style={{ backgroundColor: '#ECFDF5', color: 'var(--status-success)' }}>
            <ShieldCheck size={24} />
          </div>
          <div className="stat-content">
            <p>تم الحل والإغلاق</p>
            <h3>{loading ? '-' : resolved}</h3>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon" style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <p>معدل الحل الإجمالي</p>
            <h3>{loading ? '-' : `${resolutionRate}%`}</h3>
          </div>
        </div>

      </div>

      {/* ── Charts Row ─────────────────────────────────────────── */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: '1.6fr 1fr' }}>

        {/* Category Bar Chart */}
        <div className="card">
          <div className="section-header">
            <h3 className="section-title">توزيع الشكاوى حسب القطاع (AI)</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>مصنف تلقائياً</span>
          </div>
          <div className="chart-container" style={{ height: '280px' }}>
            {loading ? <p style={{ textAlign: 'center', paddingTop: '80px', color: 'var(--text-secondary)' }}>جاري التحميل...</p> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catData} margin={{ top: 5, right: 10, left: -15, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} angle={-25} textAnchor="end" />
                  <YAxis tick={{ fontSize: 12, fill: '#64748B' }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" name="عدد الشكاوى" radius={[6, 6, 0, 0]}>
                    {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Severity Pie */}
        <div className="card">
          <div className="section-header">
            <h3 className="section-title">توزيع مستويات الخطورة</h3>
          </div>
          <div className="chart-container" style={{ height: '280px' }}>
            {loading ? <p style={{ textAlign: 'center', paddingTop: '80px', color: 'var(--text-secondary)' }}>جاري التحميل...</p> : (
              pieData.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={95} paddingAngle={4} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={['#10B981', '#F59E0B', '#EF4444'][i]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend iconType="circle" iconSize={10} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p style={{ textAlign: 'center', paddingTop: '80px', color: 'var(--text-secondary)' }}>لا توجد بيانات</p>
            )}
          </div>
        </div>

      </div>

      {/* ── Weekly Trend ──────────────────────────────────────── */}
      <div className="card">
        <div className="section-header">
          <h3 className="section-title">منحنى الشكاوى الأسبوعي</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>أيام الأسبوع</span>
        </div>
        <div className="chart-container" style={{ height: '220px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1D70B8" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1D70B8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="cases" name="شكاوى" stroke="#1D70B8" strokeWidth={3} fillOpacity={1} fill="url(#adminGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Recent Complaints Table ───────────────────────────── */}
      <div className="recent-complaints card">
        <div className="section-header">
          <h3 className="section-title">أحدث الشكاوى الواردة</h3>
          <button
            className="btn-outline"
            style={{ padding: '6px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => navigate('/admin/reports')}
          >
            <Eye size={15} /> عرض الكل
          </button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>رقم الشكوى</th>
                <th>المشتكي</th>
                <th>المنطقة</th>
                <th>القطاع (AI)</th>
                <th>الخطورة</th>
                <th>الحالة</th>
                <th>تاريخ الورود</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>جاري جلب البيانات...</td></tr>
              )}
              {!loading && complaints.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>لا توجد شكاوى حالياً</td></tr>
              )}
              {!loading && recentComplaints.map(c => {
                const sev = severityLabel(c.ai_severity);
                const st = statusLabels[c.status] || { label: c.status, cls: 'level-normal' };
                return (
                  <tr key={c.id} onClick={() => navigate(`/complaint/${c.id}`)} style={{ cursor: 'pointer' }}>
                    <td className="complaint-id">{c.complaint_number}</td>
                    <td>
                      <div><strong>{c.complainant_name}</strong></div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.complainant_phone}</div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{c.region}</td>
                    <td>{c.ai_category || '—'}</td>
                    <td>
                      <span className={`status-badge ${sev.cls}`}>{sev.label}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${st.cls}`}>{st.label}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                      {new Date(c.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
