import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Lock, HeartHandshake, ArrowLeft } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Logo from '../components/Logo';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    
    // Call the AuthContext login function
    const result = await login(username, password);
    
    if (result.success) {
      if (result.role === 'admin') navigate('/admin', { replace: true });
      else navigate('/', { replace: true });
    } else {
      setErrorMsg('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-split">
        {/* الجانب الأيمن: نموذج الدخول */}
        <div className="login-form-side">
          <div className="login-form-wrapper">
            <div className="login-brand">
              <Logo size={48} />
              <h2>نظام شكوتي</h2>
            </div>
            
            <div className="login-header">
              <h1>بوابة الدخول الموحد</h1>
              <p>يرجى إدخال بيانات الاعتماد للوصول إلى لوحة التحكم</p>
            </div>

            {errorMsg && <div style={{backgroundColor: '#FEF2F2', color: '#DC2626', padding: '10px', borderRadius: '8px', marginBottom: '15px'}}>{errorMsg}</div>}

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label>اسم المستخدم</label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input type="text" placeholder="مثال: admin" required value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label>كلمة المرور</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              </div>

              <div className="form-actions-row">
                <label className="remember-me">
                  <input type="checkbox" />
                  تذكرني
                </label>
                <a href="#" className="forgot-password">نسيت كلمة المرور؟</a>
              </div>
              
              <button type="submit" className="btn-primary login-btn" disabled={loading} style={{width: '100%', padding: '12px', display: 'flex', justifyContent: 'center', gap: '8px'}}>
                {loading ? 'جاري التحقق...' : 'دخول النظام'}
              </button>

              <div className="signup-prompt" style={{marginTop: '25px', textAlign: 'center', fontSize: '0.95rem'}}>
                <span style={{color: 'var(--text-secondary)'}}>ليس لديك حساب كباحث اجتماعي؟ </span>
                <a onClick={() => navigate('/register')} style={{color: 'var(--primary-blue)', fontWeight: '600', cursor: 'pointer'}}>إنشاء حساب جديد</a>
              </div>
            </form>
          </div>
        </div>

        {/* الجانب الأيسر: الرسوميات والمميزات */}
        <div className="login-hero-side">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <div className="hero-badge">
              <Shield size={14} /> بوابة الثقة
            </div>
            <h1>منصة الإدارة المتكاملة للشكاوى الإنسانية</h1>
            <p className="hero-description">
              نظام مدعوم بالذكاء الاصطناعي لضمان وصول أصوات المواطنين وحل قضاياهم بالسرعة والكفاءة المطلوبة.
            </p>
            
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <Shield size={24} />
                </div>
                <div className="feature-info">
                  <h3>حماية وموثوقية</h3>
                  <p>بيانات الهوية وتفاصيل الشكاوى مشفرة بالكامل وفق أعلى المعايير.</p>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon ai-glowing">
                  <HeartHandshake size={24} />
                </div>
                <div className="feature-info">
                  <h3>تصنيف ذكي (AI)</h3>
                  <p>تحليل فوري ونسب الشكوى للقطاع المختص مباشرة بدقة عالية.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hero-footer">
            <span>حقوق الطبع محفوظة © 2026 - نظام شكوتي الذكي</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
