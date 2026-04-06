import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Trash2, Edit, SlidersHorizontal, X } from 'lucide-react';
import api from '../utils/api';
import ConfirmModal from '../components/ConfirmModal';
import { SkeletonTableRow } from '../components/SkeletonCard';
import './Dashboard.css';

const ComplaintsList = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterRegion, setFilterRegion] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);

  // ConfirmModal state
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await api.get('/complaints/');
      setComplaints(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

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

  // Unique regions for the filter dropdown
  const regions = [...new Set(complaints.map(c => c.region).filter(Boolean))];

  const filteredComplaints = [...complaints].reverse().filter(c => {
    const matchesSearch = (c.complaint_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.complainant_name || '').includes(searchTerm) ||
                          (c.complainant_id_number || '').includes(searchTerm) ||
                          (c.case_number || '').includes(searchTerm);
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    const matchesSeverity = filterSeverity === 'ALL' ||
                            (filterSeverity === 'critical' && c.ai_severity >= 4) ||
                            (filterSeverity === 'warning' && c.ai_severity === 3) ||
                            (filterSeverity === 'normal' && c.ai_severity <= 2);
    const matchesRegion = filterRegion === 'ALL' || c.region === filterRegion;
    return matchesSearch && matchesStatus && matchesSeverity && matchesRegion;
  });

  const activeFiltersCount = [filterStatus !== 'ALL', filterSeverity !== 'ALL', filterRegion !== 'ALL'].filter(Boolean).length;

  const clearFilters = () => {
    setFilterStatus('ALL');
    setFilterSeverity('ALL');
    setFilterRegion('ALL');
    setSearchTerm('');
  };

  return (
    <div className="dashboard-container">
      <div className="page-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>سجل الشكاوى الشامل</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            {loading ? '...' : `${filteredComplaints.length} شكوى من أصل ${complaints.length}`}
          </p>
        </div>
      </div>

      {/* Search + Filter Row */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="ابحث برقم الشكوى، الاسم، أو الهوية..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '10px 40px 10px 12px',
                border: '1px solid var(--border-color)', borderRadius: '8px',
                fontSize: '0.9rem', fontFamily: 'Tajawal, sans-serif', direction: 'rtl',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
              border: `1px solid ${activeFiltersCount > 0 ? 'var(--primary-blue)' : 'var(--border-color)'}`,
              borderRadius: '8px', background: activeFiltersCount > 0 ? '#EEF2FF' : 'white',
              color: activeFiltersCount > 0 ? 'var(--primary-blue)' : 'var(--text-secondary)',
              cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', fontSize: '0.9rem'
            }}
          >
            <SlidersHorizontal size={16} />
            فلاتر
            {activeFiltersCount > 0 && (
              <span style={{
                background: 'var(--primary-blue)', color: 'white',
                borderRadius: '50%', width: '18px', height: '18px',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: '700'
              }}>{activeFiltersCount}</span>
            )}
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px',
                border: '1px solid #FECACA', borderRadius: '8px', background: '#FEF2F2',
                color: '#EF4444', cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', fontSize: '0.85rem'
              }}
            >
              <X size={14} /> مسح الكل
            </button>
          )}
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div style={{
            marginTop: '12px', paddingTop: '12px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex', gap: '12px', flexWrap: 'wrap'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>الحالة</label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontFamily: 'Tajawal, sans-serif', fontSize: '0.9rem' }}
              >
                <option value="ALL">جميع الحالات</option>
                <option value="PENDING">قيد الانتظار</option>
                <option value="IN_PROGRESS">قيد المعالجة</option>
                <option value="RESOLVED">تم الحل</option>
                <option value="CLOSED">مغلقة</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>مستوى الخطورة</label>
              <select
                value={filterSeverity}
                onChange={e => setFilterSeverity(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontFamily: 'Tajawal, sans-serif', fontSize: '0.9rem' }}
              >
                <option value="ALL">جميع المستويات</option>
                <option value="critical">🔴 حرج (4-5)</option>
                <option value="warning">🟡 هام (3)</option>
                <option value="normal">🟢 عادي (1-2)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>المنطقة</label>
              <select
                value={filterRegion}
                onChange={e => setFilterRegion(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontFamily: 'Tajawal, sans-serif', fontSize: '0.9rem' }}
              >
                <option value="ALL">جميع المناطق</option>
                {regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card table-responsive" style={{ padding: '0' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>رقم الشكوى</th>
              <th>المشتكي</th>
              <th>رقم الهوية</th>
              <th>القطاع (AI)</th>
              <th>مستوى الخطورة</th>
              <th>الحالة</th>
              <th>تاريخ الإدخال</th>
              <th>خيارات</th>
            </tr>
          </thead>
          <tbody>
            {loading && <><SkeletonTableRow cols={8} /><SkeletonTableRow cols={8} /><SkeletonTableRow cols={8} /></>}
            {!loading && filteredComplaints.length === 0 && (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                لا توجد شكاوى مطابقة
              </td></tr>
            )}
            {!loading && filteredComplaints.map(c => (
              <tr key={c.id} onClick={() => navigate(`/complaint/${c.id}`)} style={{ cursor: 'pointer' }}>
                <td className="complaint-id">{c.complaint_number}</td>
                <td>
                  <strong>{c.complainant_name}</strong>
                  <br /><span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.camp_name || c.region}</span>
                </td>
                <td>
                   {c.complainant_id_number}
                   {c.case_number && <div style={{ fontSize: '0.75rem', color: 'var(--primary-blue)' }}>حالة: {c.case_number}</div>}
                </td>
                <td>{c.ai_category}</td>
                <td>
                  <span className={`status-badge ${c.ai_severity >= 4 ? 'critical' : c.ai_severity >= 3 ? 'warning' : 'success'}`}>
                    {c.ai_severity} - {c.ai_severity >= 4 ? 'حرج' : c.ai_severity >= 3 ? 'هام' : 'عادي'}
                  </span>
                </td>
                <td>
                  <div className="status-badge" style={{
                    backgroundColor: c.status === 'PENDING' ? '#FFFBEB' : c.status === 'RESOLVED' ? '#ECFDF5' : '#EEF2FF',
                    color: c.status === 'PENDING' ? '#F59E0B' : c.status === 'RESOLVED' ? '#10B981' : '#1D70B8'
                  }}>
                    {c.status === 'PENDING' ? 'قيد الانتظار' : c.status === 'RESOLVED' ? 'محلول' :
                     c.status === 'CLOSED' ? 'مغلق' : 'تحت المعالجة'}
                  </div>
                </td>
                <td className="text-secondary">{new Date(c.created_at).toLocaleDateString('ar-EG')}</td>
                <td style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/complaint/edit/${c.id}`); }}
                    style={{ background: 'none', border: 'none', color: 'var(--primary-blue)', cursor: 'pointer', padding: '5px', borderRadius: '6px' }}
                    title="تعديل"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(e, c.id)}
                    style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '5px', borderRadius: '6px' }}
                    title="حذف"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="حذف هذه الشكوى؟"
        message="سيتم إزالة الشكوى نهائياً من سجلات النظام ولا يمكن التراجع."
      />
    </div>
  );
};

export default ComplaintsList;
