import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bot, User, Clock, CheckCircle, FileText, AlertTriangle, MessageSquare, Trash2, ShieldCheck, Sparkles, Edit } from 'lucide-react';
import api from '../utils/api';
import ConfirmModal from '../components/ConfirmModal';
import './ComplaintDetails.css';

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  // States for editable AI panel
  const [level, setLevel] = useState(1);
  const [category, setCategory] = useState("عام");

  // Modal State
  const [showConfirm, setShowConfirm] = useState(false);
  
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await api.get(`/complaints/${id}/`);
        setComplaint(data);
        setLevel(data.ai_severity);
        setCategory(data.ai_category);
        setLoading(false);
      } catch (err) {
        console.error(err);
        alert('هذه الشكوى غير موجودة أو انتهت صلاحية الجلسة!');
        navigate('/');
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, navigate]);

  const updateStatus = async () => {
    try {
      await api.post(`/complaints/${id}/update_status/`, { 
        status: 'IN_PROGRESS', 
        note: 'تم الاعتماد وتحويلها للمتابعة الميدانية' 
      });
      alert('تم اعتماد التحليل وتحويل الحالة!');
      window.location.reload();
    } catch(e) {
      console.error(e);
      alert('فشل تحديث الحالة: ' + e.message);
    }
  };

  const handleConfirmDelete = async () => {
    setShowConfirm(false);
    try {
      await api.delete(`/complaints/${id}/`);
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء محاولة الحذف.');
    }
  };

  if (loading) {
    return <div style={{padding: '50px', textAlign: 'center', fontSize: '1.2rem', color: 'var(--primary-blue)'}}>جاري جلب البيانات...</div>;
  }

  if (!complaint) return null;

  return (
    <div className="complaint-details-page">
      <div className="details-header">
        <div className="header-breadcrumbs" style={{marginBottom: '10px'}}>
          <span onClick={() => navigate('/')} style={{cursor: 'pointer', color: 'var(--text-secondary)'}}>لوحة التحكم</span> / 
          <span className="active-path"> {complaint.complaint_number}</span>
        </div>
        <div className="header-title-row" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            <h1>تفاصيل الشكوى {complaint.complaint_number}</h1>
            <div className="status-badge" style={{
              fontSize: '1rem', padding: '6px 16px', 
              backgroundColor: complaint.status === 'PENDING' ? '#FFFBEB' : complaint.status === 'RESOLVED' ? '#ECFDF5' : '#EEF2FF',
              color: complaint.status === 'PENDING' ? '#F59E0B' : complaint.status === 'RESOLVED' ? '#10B981' : '#1D70B8'
            }}>
              {complaint.status === 'PENDING' ? 'قيد الانتظار' : complaint.status === 'RESOLVED' ? 'محلول' : 'قيد المعالجة'}
            </div>
          </div>
          
          <div style={{display: 'flex', gap: '10px'}}>
            <button 
              onClick={() => navigate(`/complaint/edit/${id}`)}
              style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: 'var(--primary-blue)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}
            >
              <Edit size={18} /> تعديل بيانات الشكوى
            </button>
            <button 
              onClick={() => setShowConfirm(true)}
              style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}
            >
              <Trash2 size={18} /> حذف
            </button>
          </div>
        </div>
      </div>

      <div className="details-layout">
        <div className="main-info">
          
          <div className="card info-section">
            <h3 className="section-title"><User size={20} /> بيانات المشتكي</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>الاسم الرباعي</label>
                <p>{complaint.complainant_name}</p>
              </div>
              <div className="info-item">
                <label>رقم الهوية</label>
                <p>{complaint.complainant_id_number}</p>
              </div>
              <div className="info-item">
                <label>المحافظة</label>
                <p>{complaint.region}</p>
              </div>
              <div className="info-item">
                <label>اسم المخيم</label>
                <p>{complaint.camp_name || 'غير محدد'}</p>
              </div>
              <div className="info-item">
                <label>رقم الحالة</label>
                <p>{complaint.case_number || 'غير متوفر'}</p>
              </div>
              <div className="info-item">
                <label>رقم التواصل</label>
                <p>{complaint.complainant_phone}</p>
              </div>
            </div>
          </div>

          <div className="card info-section">
            <h3 className="section-title"><MessageSquare size={20} /> النص الأصلي للشكوى</h3>
            <div className="original-text">
              "{complaint.original_text}"
            </div>
          </div>

          <div className="card info-section timeline-section">
            <h3 className="section-title"><Clock size={20} /> سجل الحالة</h3>
            <div className="timeline">
              {complaint.timeline && complaint.timeline.length > 0 ? complaint.timeline.map((item, index) => (
                <div className="timeline-item" key={item.id}>
                  <div className={`timeline-marker ${index === 0 ? 'active' : ''}`}></div>
                  <div className="timeline-content">
                    <h4>{item.action_title}</h4>
                    <p>{item.action_description}</p>
                    <span>{new Date(item.action_date).toLocaleString('ar-EG')}</span>
                  </div>
                </div>
              )) : (
                <p>لا يوجد سجلات لهذه الحالة</p>
              )}
            </div>
          </div>
          
        </div>

        <div className="ai-panel">
          <div className="card ai-card">
            <div className="ai-header">
              <div className="ai-title">
                <Bot size={24} color="#1D70B8" />
                <h3>تحليل الذكاء الاصطناعي (AI)</h3>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px'}}>
                <span className="ai-badge" style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                  <Sparkles size={12} /> تم التشخيص آلياً
                </span>
                <span style={{fontSize: '0.7rem', color: '#64748b'}}>بواسطة نموذج Groq LLM</span>
              </div>
            </div>
            
            <div className="ai-content">
              <div className="ai-group">
                <label>التلخيص الذكي</label>
                <div className="ai-summary-box">
                  {complaint.ai_summary || "جاري التحليل..."}
                </div>
              </div>

              <div className="ai-group">
                <label>التصنيف المقترح <span className="editable-hint">(قابل للتعديل)</span></label>
                <select 
                  className="form-control" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>عام</option>
                  <option>تحرش وانتهاكات</option>
                  <option>سرقة وفساد</option>
                  <option>نقص إمدادات المياه</option>
                  <option>أضرار البنية التحتية</option>
                  <option>نقص غذائي</option>
                  <option>رعاية صحية</option>
                </select>
              </div>

              <div className="ai-group">
                <label>مستوى الخطورة الآلي <span className="editable-hint">(من 1 إلى 5)</span></label>
                <div className="level-selector">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button 
                      key={num}
                      className={`level-btn ${level === num ? 'active' : ''} ${level === num && num >= 4 ? 'critical' : ''}`}
                      onClick={() => setLevel(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                {level >= 4 && (
                  <div className="level-warning-msg">
                    <AlertTriangle size={16} /> يصنف كحالة طارئة تتطلب تدخلاً فورياً
                  </div>
                )}
              </div>
            </div>

            <div className="ai-actions">
              <button className="btn-primary" onClick={updateStatus} style={{width: '100%', marginBottom: '10px'}}>
                <CheckCircle size={18} style={{marginLeft: '8px'}}/> اعتماد التحليل وتوجيه الشكوى
              </button>
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="حذف هذه الشكوى؟"
        message="تحذير: لا يمكن التراجع عن هذا الإجراء. سيتم إزالة كافة البيانات المتعلقة بهذه الشكوى من النظام."
      />
    </div>
  );
};

export default ComplaintDetails;
