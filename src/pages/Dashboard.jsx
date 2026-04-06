import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, CheckCircle, TrendingUp, Bell, PlusCircle, AlertCircle, Trash2, Edit } from 'lucide-react';
import api from '../utils/api';
import ConfirmModal from '../components/ConfirmModal';
import { SkeletonStatCard, SkeletonTableRow } from '../components/SkeletonCard';
import './Dashboard.css';

// Remove hardcoded static data

const Dashboard = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const data = await api.get('/complaints/');
      setComplaints(data || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // ─── Process Weekly Activity Data (Dynamic) ───────────────────
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const weeklyMap = {};
  complaints.forEach(c => {
    const d = new Date(c.created_at);
    const key = days[d.getDay()];
    weeklyMap[key] = (weeklyMap[key] || 0) + 1;
  });
  // Order it optimally for display (Start with Sat, End with Fri is typical in Arab countries)
  const orderedDays = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  const weeklyData = orderedDays.map(name => ({
    name,
    cases: weeklyMap[name] || 0
  }));

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setSelectedId(id);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirm(false);
    try {
      await api.delete(`/complaints/${selectedId}/`);
      fetchComplaints();
    } catch (err) {
      console.error(err);
      alert('خطأ في الحذف: ' + err.message);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="welcome-banner card">
        <div>
          <h2>مرحباً بك مجدداً 👋</h2>
          <p>
            {loading ? 'جاري تحميل البيانات...' : `لديك ${complaints.length} شكوى مسجلة، و ${complaints.filter(c => c.status === 'PENDING').length} قيد الانتظار لمراجعتها.`}
          </p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/new')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PlusCircle size={18} /> إدخال شكوى جديدة
        </button>
      </div>

      <div className="stats-grid">
        {loading ? (
          <>
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </>
        ) : (
          <>
            <div className="stat-card card">
              <div className="stat-icon" style={{ backgroundColor: '#EEF2FF', color: 'var(--primary-blue)' }}>
                <Clock size={24} />
              </div>
              <div className="stat-content">
                <p>الشكاوى المعلقة (تحت المراجعة)</p>
                <h3>{complaints.filter(c => c.status === 'PENDING').length}</h3>
              </div>
            </div>
            <div className="stat-card card">
              <div className="stat-icon" style={{ backgroundColor: '#FEF2F2', color: 'var(--status-critical)' }}>
                <AlertCircle size={24} />
              </div>
              <div className="stat-content">
                <p>حالات حرجة (أولوية 4 فأكثر)</p>
                <h3>{complaints.filter(c => c.ai_severity >= 4).length}</h3>
              </div>
            </div>
            <div className="stat-card card">
              <div className="stat-icon" style={{ backgroundColor: '#ECFDF5', color: 'var(--status-success)' }}>
                <CheckCircle size={24} />
              </div>
              <div className="stat-content">
                <p>الحالات المنجزة (هذا الشهر)</p>
                <h3>{complaints.filter(c => c.status === 'RESOLVED').length}</h3>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="dashboard-grid">
        <div className="chart-section card">
          <div className="section-header">
            <h3 className="section-title">نشاط الإدخال الأسبوعي</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>آخر 7 أيام</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary-blue)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--primary-blue)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip />
                <Area type="monotone" dataKey="cases" stroke="var(--primary-blue)" strokeWidth={3} fillOpacity={1} fill="url(#colorCases)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="recent-complaints card">
          <div className="section-header">
            <h3 className="section-title">أحدث الشكاوى</h3>
            <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => navigate('/complaints')}>عرض الكل</button>
          </div>
          
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>رقم الشكوى</th>
                  <th>المشتكي</th>
                  <th>متوقع احتياج</th>
                  <th>تصنيف AI</th>
                  <th>تاريخ الإدخال</th>
                  <th>إجراء</th>
                </tr>
              </thead>
              <tbody>
                {loading && <SkeletonTableRow cols={6} />}
                {loading && <SkeletonTableRow cols={6} />}
                {loading && <SkeletonTableRow cols={6} />}
                {!loading && complaints.length === 0 && <tr><td colSpan="6" style={{textAlign: 'center'}}>لا توجد شكاوى حالياً</td></tr>}
                
                {!loading && [...complaints].reverse().slice(0,5).map(c => (
                  <tr key={c.id} onClick={() => navigate(`/complaint/${c.id}`)} style={{cursor: 'pointer'}}>
                    <td className="complaint-id">{c.complaint_number}</td>
                    <td>
                      <div><strong>{c.complainant_name}</strong></div>
                      <div className="text-secondary">{c.camp_name || c.region}</div>
                    </td>
                    <td>{c.ai_category}</td>
                    <td>
                      <span className={`status-badge ${c.ai_severity >= 4 ? 'critical' : c.ai_severity >= 3 ? 'warning' : 'success'}`}>
                        {c.ai_severity >= 4 ? 'حرج' : c.ai_severity >= 3 ? 'هام' : 'عادي'}
                      </span>
                    </td>
                    <td className="text-secondary">{new Date(c.created_at).toLocaleDateString('ar-EG')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/complaint/edit/${c.id}`); }}
                          style={{ background: 'transparent', border: 'none', color: 'var(--primary-blue)', cursor: 'pointer', padding: '5px' }}
                          title="تعديل الشكوى"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteClick(e, c.id); }}
                          style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '5px' }}
                          title="حذف الشكوى"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="حذف الشكوى كلياً؟"
        message="هل أنت متأكد؟ سيتم إزالة هذه الشكوى نهائياً من سجلات النظام."
      />
    </div>
  );
};

export default Dashboard;
