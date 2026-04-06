import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Shield, ShieldOff, Trash2, Search,
  CheckCircle, Clock, AlertTriangle, User as UserIcon, X, Eye, EyeOff
} from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import './Dashboard.css';

const BACKEND = 'http://127.0.0.1:8000';

const ResearcherManagement = () => {
  const [researchers, setResearchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: '', last_name: '', username: '', password: '', role: 'researcher'
  });
  const [formError, setFormError] = useState('');

  // Modal State
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Load all users who are researchers (non-staff)
  const fetchUsers = () => {
    setLoading(true);
    const token = localStorage.getItem('access_token');
    fetch(`${BACKEND}/api/users/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { setResearchers(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = researchers.filter(u =>
    (`${u.first_name} ${u.last_name} ${u.username}`).toLowerCase().includes(search.toLowerCase())
  );

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.first_name || !form.username || !form.password) {
      setFormError('يرجى ملء جميع الحقول المطلوبة.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${BACKEND}/api/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ first_name: '', last_name: '', username: '', password: '', role: 'researcher' });
        fetchUsers();
      } else {
        const err = await res.json();
        const msg = err.username?.[0] || err.password?.[0] || 'فشل التسجيل';
        setFormError(msg);
      }
    } catch {
      setFormError('خطأ في الاتصال بالخادم');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (userId, name) => {
    setSelectedUser({ id: userId, name });
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    setShowConfirm(false);
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${BACKEND}/api/users/${selectedUser.id}/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok || res.status === 204) fetchUsers();
    else alert('فشل الحذف — تأكد من الصلاحيات');
    setSelectedUser(null);
  };

  return (
    <div className="dashboard-container">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--dark-navy)', marginBottom: '6px' }}>إدارة الباحثين</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            إضافة وإدارة حسابات الباحثين الاجتماعيين الذين يستخدمون النظام.
          </p>
        </div>
        <button
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => setShowModal(true)}
        >
          <UserPlus size={18} /> إضافة باحث جديد
        </button>
      </div>

      {/* ── Stats Row ──────────────────────────────────────────── */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '24px' }}>
        <div className="stat-card card">
          <div className="stat-icon" style={{ backgroundColor: '#EEF2FF', color: 'var(--primary-blue)' }}>
            <Users size={24} />
          </div>
          <div className="stat-content">
            <p>إجمالي الحسابات</p>
            <h3>{loading ? '—' : researchers.length}</h3>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon" style={{ backgroundColor: '#ECFDF5', color: 'var(--status-success)' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <p>باحثون اجتماعيون</p>
            <h3>{loading ? '—' : researchers.filter(u => !u.is_staff).length}</h3>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon" style={{ backgroundColor: '#F5F3FF', color: '#7C3AED' }}>
            <Shield size={24} />
          </div>
          <div className="stat-content">
            <p>مسؤولو النظام</p>
            <h3>{loading ? '—' : researchers.filter(u => u.is_staff).length}</h3>
          </div>
        </div>
      </div>

      {/* ── Search + Table ─────────────────────────────────────── */}
      <div className="card">
        <div className="section-header" style={{ marginBottom: '16px' }}>
          <h3 className="section-title">قائمة المستخدمين</h3>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="بحث بالاسم أو معرف الدخول..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: '9px 36px 9px 14px', borderRadius: '8px',
                border: '1px solid var(--border-color)', fontFamily: 'Tajawal, sans-serif',
                fontSize: '0.9rem', direction: 'rtl', width: '260px'
              }}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>الاسم الكامل</th>
                <th>معرف الدخول</th>
                <th>البريد الإلكتروني</th>
                <th>الدور</th>
                <th>إجراء</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  جاري تحميل البيانات...
                </td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  {search ? 'لا توجد نتائج مطابقة' : 'لا يوجد مستخدمون مسجلون بعد'}
                </td></tr>
              )}
              {!loading && filtered.map((u, i) => (
                <tr key={u.id}>
                  <td style={{ color: 'var(--text-secondary)', width: '40px' }}>{i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        backgroundColor: u.is_staff ? '#EDE9FE' : '#EEF2FF',
                        color: u.is_staff ? '#7C3AED' : 'var(--primary-blue)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '700', fontSize: '0.9rem', flexShrink: 0
                      }}>
                        {u.first_name ? u.first_name[0] : <UserIcon size={16} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                          {u.first_name} {u.last_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--primary-blue)', fontWeight: '600' }}>
                    @{u.username}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.email || '—'}</td>
                  <td>
                    <span className={`status-badge ${u.is_staff ? 'critical' : 'success'}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {u.is_staff ? <><Shield size={12} /> مسؤول</> : <><CheckCircle size={12} /> باحث</>}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDeleteClick(u.id, `${u.first_name} ${u.last_name}`)}
                      style={{
                        background: 'transparent', border: 'none', color: '#EF4444',
                        cursor: 'pointer', padding: '6px', borderRadius: '6px',
                        transition: 'background 0.2s'
                      }}
                      title="حذف الحساب"
                      onMouseOver={e => e.currentTarget.style.background = '#FEF2F2'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Trash2 size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add Researcher Modal ───────────────────────────────── */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)',
          backdropFilter: 'blur(4px)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '480px',
            padding: '32px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', position: 'relative'
          }}>
            <button
              onClick={() => { setShowModal(false); setFormError(''); }}
              style={{ position: 'absolute', top: '16px', left: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              <X size={22} />
            </button>

            <h2 style={{ marginBottom: '6px', color: 'var(--dark-navy)', fontSize: '1.2rem' }}>إضافة باحث جديد</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
              سيتمكن الباحث من تسجيل الدخول وإدارة الشكاوى.
            </p>

            {formError && (
              <div style={{
                backgroundColor: '#FEF2F2', color: '#EF4444', borderRadius: '8px',
                padding: '10px 14px', marginBottom: '16px', fontSize: '0.9rem',
                border: '1px solid #FECACA', display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <AlertTriangle size={16} /> {formError}
              </div>
            )}

            <form onSubmit={handleRegister}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px', fontSize: '0.9rem' }}>الاسم الأول *</label>
                  <input className="form-control" value={form.first_name}
                    onChange={e => setForm({ ...form, first_name: e.target.value })} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px', fontSize: '0.9rem' }}>اسم العائلة</label>
                  <input className="form-control" value={form.last_name}
                    onChange={e => setForm({ ...form, last_name: e.target.value })} />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px', fontSize: '0.9rem' }}>معرف الدخول (Username) *</label>
                <input className="form-control" value={form.username} autoComplete="off"
                  onChange={e => setForm({ ...form, username: e.target.value })} required />
              </div>

              <div style={{ marginBottom: '14px', position: 'relative' }}>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px', fontSize: '0.9rem' }}>كلمة المرور *</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  style={{ paddingLeft: '40px' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', bottom: '10px', left: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px', fontSize: '0.9rem' }}>الدور</label>
                <select className="form-control" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="researcher">باحث اجتماعي</option>
                  <option value="admin">مدير النظام</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-primary" disabled={saving}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {saving ? 'جاري الحفظ...' : <><UserPlus size={17} /> إضافة الحساب</>}
                </button>
                <button type="button" className="btn-outline"
                  onClick={() => { setShowModal(false); setFormError(''); }}
                  style={{ flex: 1 }}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="حذف حساب المستخدم؟"
        message={`هل أنت متأكد من حذف حساب "${selectedUser?.name}" نهائياً؟ لا يمكن استعادة البيانات بعد ذلك.`}
      />
    </div>
  );
};

export default ResearcherManagement;
