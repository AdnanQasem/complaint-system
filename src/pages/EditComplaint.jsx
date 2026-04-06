import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react';
import api from '../utils/api';
import './NewComplaint.css'; // Re-use styles

const EditComplaint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    complainant_name: '',
    complainant_id_number: '',
    complainant_phone: '',
    region: '',
    camp_name: '',
    case_number: '',
    original_text: ''
  });

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const data = await api.get(`/complaints/${id}/`);
        setFormData({
          complainant_name: data.complainant_name,
          complainant_id_number: data.complainant_id_number,
          complainant_phone: data.complainant_phone,
          region: data.region,
          camp_name: data.camp_name || '',
          case_number: data.case_number || '',
          original_text: data.original_text
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching complaint:', error);
        alert('حدث خطأ أثناء جلب بيانات الشكوى.');
        navigate('/');
      }
    };
    fetchComplaint();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.complainant_name.trim() || !formData.original_text.trim()) {
      alert('يرجى التأكد من ملء جميع الحقول المطلوبة.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.patch(`/complaints/${id}/`, formData);
      navigate(`/complaint/${id}`);
    } catch (error) {
      alert('حدث خطأ أثناء التحديث: ' + error.message);
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="page-wrapper" style={{textAlign: 'center', padding: '50px'}}>جاري تحميل البيانات...</div>;

  return (
    <div className="new-complaint-page">
      {isSubmitting && (
        <div className="fullscreen-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)',
          zIndex: 9999, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', color: 'white'
        }}>
          <RefreshCw size={50} color="#38bdf8" style={{ animation: 'spin 1s linear infinite', marginBottom: '20px' }} />
          <h2 style={{ color: 'white' }}>جاري تحديث البيانات...</h2>
          <p style={{ color: '#cbd5e1' }}>يتم الآن إعادة تحليل النص وتحديث السجلات 🧠</p>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      <div className="page-header">
        <h1>تعديل بيانات الشكوى</h1>
        <p>يمكنك تعديل معلومات المشتكي أو نص الشكوى وسيتم إعادة التحليل تلقائياً</p>
      </div>

      <div className="form-container card" style={{maxWidth: '800px', margin: '0 auto'}}>
        <form onSubmit={handleSubmit}>
          <div className="form-step">
            <h3 className="step-title">البيانات الشخصية</h3>
            <div className="form-row" style={{display: 'flex', gap: '20px', marginBottom: '20px'}}>
              <div className="form-group" style={{flex: 1}}>
                <label className="form-label">الاسم الرباعي</label>
                <input type="text" name="complainant_name" value={formData.complainant_name} onChange={handleInputChange} className="form-control" required />
              </div>
              <div className="form-group" style={{flex: 1}}>
                <label className="form-label">رقم الهوية</label>
                <input type="text" name="complainant_id_number" value={formData.complainant_id_number} onChange={handleInputChange} className="form-control" required />
              </div>
            </div>
            <div className="form-row" style={{display: 'flex', gap: '20px', marginBottom: '20px'}}>
              <div className="form-group" style={{flex: 1}}>
                <label className="form-label">المحافظة / المنطقة</label>
                <select name="region" value={formData.region} onChange={handleInputChange} className="form-control" required>
                  <option value="">اختر المنطقة...</option>
                  <option value="شمال غزة">شمال غزة</option>
                  <option value="غزة">غزة</option>
                  <option value="المنطقة الوسطى">المنطقة الوسطى</option>
                  <option value="خانيونس">خانيونس</option>
                  <option value="رفح">رفح</option>
                </select>
              </div>
              <div className="form-group" style={{flex: 1}}>
                <label className="form-label">اسم المخيم</label>
                <input type="text" name="camp_name" value={formData.camp_name} onChange={handleInputChange} className="form-control" />
              </div>
            </div>
            <div className="form-row" style={{display: 'flex', gap: '20px', marginBottom: '20px'}}>
              <div className="form-group" style={{flex: 1}}>
                <label className="form-label">رقم الحالة (اختياري)</label>
                <input type="text" name="case_number" value={formData.case_number} onChange={handleInputChange} className="form-control" />
              </div>
              <div className="form-group" style={{flex: 1}}>
                <label className="form-label">رقم الهاتف للهاتف للتواصل</label>
                <input type="tel" name="complainant_phone" value={formData.complainant_phone} onChange={handleInputChange} className="form-control" required />
              </div>
            </div>

            <h3 className="step-title" style={{marginTop: '30px'}}>نص الشكوى</h3>
            <div className="form-group">
              <textarea 
                name="original_text"
                value={formData.original_text}
                onChange={handleInputChange}
                className="form-control" 
                rows="8" 
                required
              ></textarea>
              <div style={{marginTop: '10px', fontSize: '0.85rem', color: 'var(--status-warning)', display: 'flex', alignItems: 'center', gap: '5px'}}>
                <AlertTriangle size={14} /> ملاحظة: تغيير نص الشكوى سيؤدي لمسح التحليل القديم وإصدار تحليل جديد بواسطة الذكاء الاصطناعي.
              </div>
            </div>
          </div>

          <div className="form-actions" style={{marginTop: '30px', display: 'flex', justifyContent: 'space-between'}}>
            <button type="button" className="btn-outline" onClick={() => navigate(-1)}>
              إلغاء التعديل
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting} style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات وإعادة التحليل'}
              {!isSubmitting && <Save size={18} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditComplaint;
