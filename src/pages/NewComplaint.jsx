import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import './NewComplaint.css';

const NewComplaint = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Data State
  const [formData, setFormData] = useState({
    complainant_name: '',
    complainant_id_number: '',
    complainant_phone: '',
    region: '',
    camp_name: '',
    case_number: '',
    original_text: ''
  });

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.complainant_name.trim() || !formData.original_text.trim()) {
      alert('يرجى التأكد من ملء جميع الحقول المطلوبة بشكل صحيح.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const data = await api.post('/complaints/', formData);
      // Redirect to the newly created complaint details page
      navigate(`/complaint/${data.id}`);
    } catch (error) {
      alert('حدث خطأ أثناء الإرسال: ' + error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="new-complaint-page">
      {isSubmitting && (
        <div className="fullscreen-overlay" style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <RefreshCw size={50} color="#38bdf8" style={{ animation: 'spin 1s linear infinite', marginBottom: '20px' }} />
          <h2 style={{ color: 'white', marginBottom: '10px' }}>جاري تحليل الشكوى...</h2>
          <p style={{ color: '#cbd5e1' }}>يتم الآن معالجة وتقييم مستوى الخطورة بواسطة الذكاء الاصطناعي 🧠</p>
          <style>{`
            @keyframes spin { 100% { transform: rotate(360deg); } }
          `}</style>
        </div>
      )}

      <div className="page-header">
        <h1>إدخال شكوى جديدة</h1>
        <p>الرجاء تعبئة بيانات الشكوى بدقة للتصنيف التلقائي لاحقاً</p>
      </div>

      <div className="form-container card">
        <div className="stepper">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <span>معلومات المشتكي</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <span>تفاصيل الشكوى</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span>المرفقات والمراجعة</span>
          </div>
        </div>

        <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
          
          {step === 1 && (
            <div className="form-step">
              <h3 className="step-title">البيانات الشخصية للمشتكي</h3>
              <div className="form-row">
                <div className="form-group flex-1">
                  <label className="form-label">الاسم الرباعي</label>
                  <input type="text" name="complainant_name" value={formData.complainant_name} onChange={handleInputChange} className="form-control" required />
                </div>
                <div className="form-group flex-1">
                  <label className="form-label">رقم الهوية</label>
                  <input type="text" name="complainant_id_number" value={formData.complainant_id_number} onChange={handleInputChange} className="form-control" required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group flex-1">
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
                <div className="form-group flex-1">
                  <label className="form-label">اسم المخيم</label>
                  <input type="text" name="camp_name" value={formData.camp_name} onChange={handleInputChange} className="form-control" placeholder="مثل: مخيم جباليا" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group flex-1">
                  <label className="form-label">رقم الحالة (اختياري)</label>
                  <input type="text" name="case_number" value={formData.case_number} onChange={handleInputChange} className="form-control" placeholder="رقم الحالة في السجلات" />
                </div>
                <div className="form-group flex-1">
                  <label className="form-label">رقم الهاتف للتواصل</label>
                  <input type="tel" name="complainant_phone" value={formData.complainant_phone} onChange={handleInputChange} className="form-control" required />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <h3 className="step-title">النص الأصلي للشكوى</h3>
              <p className="step-help">يرجى كتابة نص الشكوى كما ورد من المشتكي تماماً. سيقوم الذكاء الاصطناعي بتحليله وتلخيصه لاحقاً.</p>
              
              <div className="form-group">
                <label className="form-label">تفاصيل الشكوى</label>
                <textarea 
                  name="original_text"
                  value={formData.original_text}
                  onChange={handleInputChange}
                  className="form-control" 
                  rows="8" 
                  placeholder="نص الشكوى يتم كتابته هنا (مثل: مشكلة مياه مقطوعة من أسبوع...)" 
                  required
                ></textarea>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step">
              <h3 className="step-title">المرفقات (اختياري)</h3>
              <div className="upload-area">
                <UploadCloud size={40} color="var(--primary-blue)" />
                <p>اسحب وأفلت الملفات هنا، أو <strong>انقر للاستعراض</strong></p>
                <span className="upload-hint">يدعم صور، مستندات PDF (الحد الأقصى 5MB)</span>
              </div>
            </div>
          )}

          <div className="form-actions">
            {step > 1 ? (
              <button type="button" className="btn-outline" onClick={handlePrev}>
                <ArrowRight size={18} style={{marginLeft: '8px'}}/> السابق
              </button>
            ) : <div></div>}
            
            {step < 3 ? (
              <button type="submit" className="btn-primary">
                التالي <ArrowLeft size={18} style={{marginRight: '8px'}}/>
              </button>
            ) : (
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'جاري إرسال وتحليل الشكوى...' : 'إرسال وتحليل (AI)'}
                {!isSubmitting && <CheckCircle size={18} style={{marginRight: '8px'}}/>}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewComplaint;
