import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Lock, Briefcase, Mail, ArrowLeft, Users } from 'lucide-react';
import Logo from '../components/Logo';
import './Login.css';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    password: '',
    role: 'researcher'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('تم تسجيل الحساب بنجاح! يمكنك الآن تسجيل الدخول.');
        navigate('/login');
      } else {
        const errorData = await response.json();
        // Extract basic error message
        const firstErrorKey = Object.keys(errorData)[0];
        setErrorMsg(errorData[firstErrorKey][0] || 'حدث خطأ غير معروف');
      }
    } catch (error) {
      setErrorMsg('خطأ في الاتصال بالخادم');
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-split">
        {/* الجانب الأيمن: نموذج التسجيل */}
        <div className="login-form-side">
          <div className="login-form-wrapper">
            <div className="login-brand" style={{marginBottom: '30px'}}>
              <Logo size={48} />
              <h2>نظام شكوتي</h2>
            </div>
            
            <div className="login-header">
              <h1>إنشاء حساب جديد</h1>
              <p>انضم إلى طاقم الباحثين الميدانيين وابدأ بتسجيل الشكاوى</p>
            </div>

            {errorMsg && <div style={{backgroundColor: '#FEF2F2', color: '#DC2626', padding: '10px', borderRadius: '8px', marginBottom: '15px'}}>{errorMsg}</div>}

            <form onSubmit={handleRegister} className="login-form">
              
              <div style={{display: 'flex', gap: '15px'}}>
                <div className="form-group" style={{flex: 1}}>
                  <label>الاسم الأول</label>
                  <div className="input-with-icon">
                    <User size={18} className="input-icon" />
                    <input type="text" name="first_name" placeholder="محمد" required value={formData.first_name} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group" style={{flex: 1}}>
                  <label>اسم العائلة</label>
                  <div className="input-with-icon">
                    <Users size={18} className="input-icon" />
                    <input type="text" name="last_name" placeholder="أحمد" required value={formData.last_name} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>معرف المستخدم (Username)</label>
                <div className="input-with-icon">
                  <Briefcase size={18} className="input-icon" />
                  <input type="text" name="username" placeholder="يستخدم لتسجيل الدخول" required value={formData.username} onChange={handleChange} />
                </div>
              </div>


              <div className="form-group">
                <label>كلمة المرور</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input type="password" name="password" placeholder="••••••••" required value={formData.password} onChange={handleChange} />
                </div>
              </div>

              <button type="submit" className="btn-primary login-btn" disabled={loading} style={{width: '100%', justifyContent: 'center'}}>
                {loading ? 'جاري التسجيل...' : 'إنشاء الحساب'} 
              </button>

              <div className="signup-prompt" style={{marginTop: '25px', textAlign: 'center', fontSize: '0.95rem'}}>
                <span style={{color: 'var(--text-secondary)'}}>لديك حساب بالفعل؟ </span>
                <a onClick={() => navigate('/login')} style={{color: 'var(--primary-blue)', fontWeight: '600', cursor: 'pointer'}}>تسجيل الدخول</a>
              </div>
            </form>
          </div>
        </div>

        {/* الجانب الأيسر */}
        <div className="login-hero-side" style={{backgroundColor: '#0F172A'}}>
          <div className="hero-content">
            <div className="hero-badge">مرحباً بك</div>
            <h1>انضم إلى فريق العمل الإنساني</h1>
            <p>سواء كنت باحثاً في الميدان لتسجيل الشكاوى، أو مديراً لمراجعتها، فإن نظامنا مصمم لتسهيل المهام ورفع جودة الخدمات.</p>
            
            <div className="features-list">
              <div className="feature-item">
                <Briefcase size={24} color="#3B82F6" />
                <div>
                  <h3>باحث اجتماعي</h3>
                  <p>وصول لنماذج رفع الشكاوي والمرفقات وتتبع حالات المستفيدين.</p>
                </div>
              </div>
              <div className="feature-item">
                <Shield size={24} color="#F59E0B" />
                <div>
                  <h3>إدارة متقدمة</h3>
                  <p>تقارير، لوحات بيانات، وإدارة مهام الباحثين.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
