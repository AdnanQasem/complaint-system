import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
} from 'recharts';
import {
  FileStack, AlertTriangle, CheckCircle, Clock, TrendingUp,
  Download, Filter, Calendar, MapPin, ShieldAlert, Zap
} from 'lucide-react';
import './Dashboard.css';

const COLORS = ['#1D70B8', '#F59E0B', '#EF4444', '#10B981', '#8B5CF6', '#EC4899', '#06B6D4'];
const SEVERITY_COLORS = { 1: '#10B981', 2: '#34D399', 3: '#F59E0B', 4: '#EF4444', 5: '#DC2626' };

const ComprehensiveReports = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch('http://127.0.0.1:8000/api/complaints/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { setComplaints(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // ─── Apply Filters ────────────────────────────────────────────
  const filtered = complaints.filter(c => {
    if (filterStatus !== 'ALL' && c.status !== filterStatus) return false;
    if (filterSeverity !== 'ALL' && String(c.ai_severity) !== filterSeverity) return false;
    return true;
  });

  // ─── Stats ───────────────────────────────────────────────────
  const total     = filtered.length;
  const critical  = filtered.filter(c => c.ai_severity >= 4).length;
  const pending   = filtered.filter(c => c.status === 'PENDING').length;
  const resolved  = filtered.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length;
  const inProg    = filtered.filter(c => c.status === 'IN_PROGRESS').length;
  const rate      = total ? Math.round((resolved / total) * 100) : 0;

  // ─── Category distribution ────────────────────────────────────
  const catMap = filtered.reduce((a, c) => {
    const k = c.ai_category || 'غير مصنف';
    a[k] = (a[k] || 0) + 1;
    return a;
  }, {});
  const catData = Object.entries(catMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // ─── Region distribution ──────────────────────────────────────
  const regionMap = filtered.reduce((a, c) => {
    const k = c.region || 'غير محدد';
    a[k] = (a[k] || 0) + 1;
    return a;
  }, {});
  const regionData = Object.entries(regionMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // ─── Status distribution ──────────────────────────────────────
  const statusMap = {
    'PENDING': { label: 'قيد الانتظار', color: '#F59E0B' },
    'IN_PROGRESS': { label: 'جارٍ المعالجة', color: '#3B82F6' },
    'RESOLVED': { label: 'تم الحل', color: '#10B981' },
    'CLOSED': { label: 'مغلق', color: '#6B7280' },
  };
  const statusData = Object.entries(statusMap).map(([key, { label, color }]) => ({
    name: label,
    value: filtered.filter(c => c.status === key).length,
    color
  })).filter(d => d.value > 0);

  // ─── Severity distribution ────────────────────────────────────
  const sevLabels = { 1: 'منخفض', 2: 'عادي', 3: 'هام', 4: 'عاجل', 5: 'طارئ' };
  const sevData = [1, 2, 3, 4, 5].map(s => ({
    name: sevLabels[s],
    value: filtered.filter(c => c.ai_severity === s).length,
    fill: SEVERITY_COLORS[s]
  }));

  // ─── Daily Trend (last 30 days) ───────────────────────────────
  const now = new Date();
  const trendData = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (13 - i));
    const label = d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
    const count = filtered.filter(c => {
      const cd = new Date(c.created_at);
      return cd.toDateString() === d.toDateString();
    }).length;
    return { name: label, cases: count };
  });

  return (
    <div className="dashboard-container">

      {/* ── Page Header ──────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--dark-navy)', marginBottom: '6px' }}>التقارير الشاملة</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            تحليل معمّق وإحصائيات تفصيلية لجميع الشكاوى الواردة في النظام.
          </p>
        </div>
        <button
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => window.print()}
        >
          <Download size={17} /> تصدير التقرير (PDF)
        </button>
      </div>

      {/* ── Filters ──────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontWeight: '500', fontSize: '0.9rem' }}>
            <Filter size={16} /> تصفية البيانات:
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>الحالة</label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '7px 12px', fontFamily: 'Tajawal, sans-serif', fontSize: '0.9rem' }}
              >
                <option value="ALL">جميع الحالات</option>
                <option value="PENDING">قيد الانتظار</option>
                <option value="IN_PROGRESS">جارٍ المعالجة</option>
                <option value="RESOLVED">تم الحل</option>
                <option value="CLOSED">مغلق</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>مستوى الخطورة</label>
              <select
                value={filterSeverity}
                onChange={e => setFilterSeverity(e.target.value)}
                style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '7px 12px', fontFamily: 'Tajawal, sans-serif', fontSize: '0.9rem' }}
              >
                <option value="ALL">جميع المستويات</option>
                <option value="5">5 — طارئ جداً</option>
                <option value="4">4 — عاجل</option>
                <option value="3">3 — هام</option>
                <option value="2">2 — عادي</option>
                <option value="1">1 — منخفض</option>
              </select>
            </div>
            {(filterStatus !== 'ALL' || filterSeverity !== 'ALL') && (
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  onClick={() => { setFilterStatus('ALL'); setFilterSeverity('ALL'); }}
                  className="btn-outline"
                  style={{ padding: '7px 14px', fontSize: '0.87rem' }}
                >
                  إعادة ضبط
                </button>
              </div>
            )}
          </div>
          <div style={{ marginRight: 'auto', color: 'var(--text-secondary)', fontSize: '0.88rem', background: '#F8FAFC', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            عرض <strong>{total}</strong> شكوى من أصل <strong>{complaints.length}</strong>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────── */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '24px' }}>
        {[
          { label: 'إجمالي الشكاوى', value: total, icon: <FileStack size={24} />, bg: '#EEF2FF', color: 'var(--primary-blue)' },
          { label: 'حالات حرجة وعاجلة', value: critical, icon: <AlertTriangle size={24} />, bg: '#FEF2F2', color: 'var(--status-critical)' },
          { label: 'قيد الانتظار', value: pending, icon: <Clock size={24} />, bg: '#FFFBEB', color: '#D97706' },
          { label: 'جارٍ المعالجة', value: inProg, icon: <Zap size={24} />, bg: '#F0F9FF', color: '#0284C7' },
          { label: 'تم الحل والإغلاق', value: resolved, icon: <CheckCircle size={24} />, bg: '#ECFDF5', color: 'var(--status-success)' },
          { label: 'معدل الإنجاز', value: `${rate}%`, icon: <TrendingUp size={24} />, bg: '#F5F3FF', color: '#7C3AED' },
        ].map((kpi, i) => (
          <div key={i} className="stat-card card">
            <div className="stat-icon" style={{ backgroundColor: kpi.bg, color: kpi.color }}>{kpi.icon}</div>
            <div className="stat-content">
              <p>{kpi.label}</p>
              <h3>{loading ? '—' : kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* ── Trend Line ────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="section-header">
          <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} /> منحنى الشكاوى خلال آخر 14 يوم
          </h3>
        </div>
        <div className="chart-container" style={{ height: '230px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="trend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1D70B8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1D70B8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="cases" name="شكاوى" stroke="#1D70B8" strokeWidth={2.5} fill="url(#trend)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Category + Region ─────────────────────────────────── */}
      <div className="dashboard-grid" style={{ marginBottom: '24px' }}>

        {/* Category */}
        <div className="card">
          <div className="section-header">
            <h3 className="section-title">توزيع القطاعات (تصنيف AI)</h3>
          </div>
          <div className="chart-container" style={{ height: '280px' }}>
            {loading ? <p style={{ textAlign: 'center', paddingTop: '80px', color: 'var(--text-secondary)' }}>جاري التحميل...</p>
              : catData.length === 0 ? <p style={{ textAlign: 'center', paddingTop: '80px', color: 'var(--text-secondary)' }}>لا بيانات</p>
              : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={catData} margin={{ top: 5, right: 10, left: -15, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} angle={-30} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" name="عدد الشكاوى" radius={[6, 6, 0, 0]}>
                      {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
          </div>
        </div>

        {/* Region */}
        <div className="card">
          <div className="section-header">
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={17} /> التوزيع الجغرافي
            </h3>
          </div>
          <div className="chart-container" style={{ height: '280px' }}>
            {loading ? <p style={{ textAlign: 'center', paddingTop: '80px', color: 'var(--text-secondary)' }}>جاري التحميل...</p>
              : regionData.length === 0 ? <p style={{ textAlign: 'center', paddingTop: '80px', color: 'var(--text-secondary)' }}>لا بيانات</p>
              : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
                    <Tooltip />
                    <Bar dataKey="value" name="عدد الشكاوى" radius={[0, 6, 6, 0]}>
                      {regionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
          </div>
        </div>
      </div>

      {/* ── Status + Severity ─────────────────────────────────── */}
      <div className="dashboard-grid" style={{ marginBottom: '24px' }}>

        {/* Status Pie */}
        <div className="card">
          <div className="section-header">
            <h3 className="section-title">توزيع حالات الشكاوى</h3>
          </div>
          <div className="chart-container" style={{ height: '260px' }}>
            {loading ? <p style={{ textAlign: 'center', paddingTop: '80px', color: 'var(--text-secondary)' }}>جاري التحميل...</p>
              : statusData.length === 0 ? <p style={{ textAlign: 'center', paddingTop: '80px', color: 'var(--text-secondary)' }}>لا بيانات</p>
              : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="45%" outerRadius={90} dataKey="value">
                      {statusData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip />
                    <Legend iconType="circle" iconSize={10} />
                  </PieChart>
                </ResponsiveContainer>
              )}
          </div>
        </div>

        {/* Severity Bar */}
        <div className="card">
          <div className="section-header">
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={17} /> توزيع مستويات الخطورة
            </h3>
          </div>
          <div className="chart-container" style={{ height: '260px' }}>
            {loading ? <p style={{ textAlign: 'center', paddingTop: '80px', color: 'var(--text-secondary)' }}>جاري التحميل...</p>
              : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sevData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" name="عدد الشكاوى" radius={[6, 6, 0, 0]}>
                      {sevData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
          </div>
        </div>

      </div>

      {/* ── Summary Table ─────────────────────────────────────── */}
      <div className="card">
        <div className="section-header">
          <h3 className="section-title">قائمة الشكاوى المفصّلة ({total})</h3>
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
              {loading && <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>جاري التحميل...</td></tr>}
              {!loading && filtered.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>لا توجد نتائج</td></tr>}
              {!loading && filtered.map(c => {
                const sev = c.ai_severity;
                const sevColor = sev >= 4 ? 'critical' : sev >= 3 ? 'warning' : 'success';
                const sevText = { 5: 'طارئ', 4: 'عاجل', 3: 'هام', 2: 'عادي', 1: 'منخفض' }[sev] || '—';
                const stMap = { PENDING: { l: 'قيد الانتظار', c: 'warning' }, IN_PROGRESS: { l: 'جارٍ', c: 'level-warning' }, RESOLVED: { l: 'تم الحل', c: 'success' }, CLOSED: { l: 'مغلق', c: 'level-normal' } };
                const st = stMap[c.status] || { l: c.status, c: 'level-normal' };
                return (
                  <tr key={c.id}>
                    <td className="complaint-id">{c.complaint_number}</td>
                    <td><strong>{c.complainant_name}</strong></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{c.region || '—'}</td>
                    <td>{c.ai_category || '—'}</td>
                    <td><span className={`status-badge ${sevColor}`}>{sevText}</span></td>
                    <td><span className={`status-badge ${st.c}`}>{st.l}</span></td>
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

export default ComprehensiveReports;
