import React, { useContext, useState } from 'react';
import { User, Lock, Bell, Shield, Save, Upload, Loader } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './Dashboard.css';

const Settings = () => {
  const { user, setUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.avatar || null);
  const [isDark, setIsDark] = useState(document.documentElement.getAttribute('data-theme') === 'dark');

  const toggleDarkMode = () => {
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    setIsDark(!isDark);
  };

  // local state for form demo
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    username: user?.username || '',
    email: user?.email || '',
  });

  const handleChange = (e) => setProfileData({...profileData, [e.target.name]: e.target.value});

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const formData = new FormData();
      formData.append('first_name', profileData.first_name);
      formData.append('last_name', profileData.last_name);
      formData.append('email', profileData.email);
      if (selectedFile) {
        formData.append('avatar', selectedFile);
      }

      const response = await fetch('http://127.0.0.1:8000/api/auth/update-profile/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: formData
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        alert('تم حفظ الإعدادات بنجاح!');
      } else {
        throw new Error('فشل التحديث');
      }
    } catch (error) {
      alert('خطأ أثناء حفظ الإعدادات');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="page-header" style={{marginBottom: '20px'}}>
        <h1>إعدادات الحساب</h1>
        <p>قم بإدارة تفضيلات حسابك، وتعديل بيانات ملفك الشخصي.</p>
      </div>

      <div style={{display: 'flex', gap: '24px', alignItems: 'flex-start'}}>
        
        {/* Sidebar for settings tabs */}
        <div className="card" style={{flex: '0 0 250px', padding: '10px'}}>
          <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '5px'}}>
            <li>
              <button 
                onClick={() => setActiveTab('profile')} 
                style={{textAlign: 'right', width: '100%', padding: '12px 16px', background: activeTab === 'profile' ? '#EEF2FF' : 'transparent', color: activeTab === 'profile' ? 'var(--primary-blue)' : 'var(--text-main)', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center', fontWeight: activeTab === 'profile' ? '600' : 'normal'}}
              >
                <User size={18} /> الملف الشخصي
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('security')} 
                style={{textAlign: 'right', width: '100%', padding: '12px 16px', background: activeTab === 'security' ? '#EEF2FF' : 'transparent', color: activeTab === 'security' ? 'var(--primary-blue)' : 'var(--text-main)', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center', fontWeight: activeTab === 'security' ? '600' : 'normal'}}
              >
                <Shield size={18} /> الأمان وكلمة المرور
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('notifications')} 
                style={{textAlign: 'right', width: '100%', padding: '12px 16px', background: activeTab === 'notifications' ? '#EEF2FF' : 'transparent', color: activeTab === 'notifications' ? 'var(--primary-blue)' : 'var(--text-main)', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center', fontWeight: activeTab === 'notifications' ? '600' : 'normal'}}
              >
                <Bell size={18} /> الإشعارات
              </button>
            </li>
          </ul>
        </div>

        {/* Content Area */}
        <div className="card" style={{flex: 1, padding: '30px'}}>
          
          {activeTab === 'profile' && (
            <div>
              <h2 style={{borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '20px'}}>المعلومات الشخصية</h2>
              
              <div style={{display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px dashed var(--border-color)'}}>
                 <div style={{
                   width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#f1f5f9',
                   overflow: 'hidden', border: '3px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                   display: 'flex', alignItems: 'center', justifyContent: 'center'
                 }}>
                   {previewUrl ? (
                     <img src={previewUrl} alt="Preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                   ) : (
                     <User size={40} color="#94a3b8" />
                   )}
                 </div>
                 <div>
                   <label htmlFor="avatar-upload" style={{
                     display: 'inline-flex', alignItems: 'center', gap: '8px', 
                     padding: '10px 16px', backgroundColor: 'white', border: '1px solid var(--border-color)',
                     borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500'
                   }}>
                     <Upload size={16} /> ابحث عن صورة...
                   </label>
                   <input id="avatar-upload" type="file" onChange={handleFileChange} style={{display: 'none'}} accept="image/*" />
                   <p style={{fontSize: '0.8rem', color: '#64748b', marginTop: '8px'}}>يدعم JPG, PNG. الحد الأقصى 2MB</p>
                 </div>
              </div>

              <form onSubmit={handleSave}>
                <div style={{display: 'flex', gap: '20px', marginBottom: '15px'}}>
                   <div style={{flex: 1}}>
                      <label style={{display:'block', marginBottom:'8px', fontWeight:'500'}}>الاسم الأول</label>
                      <input type="text" className="form-control" name="first_name" value={profileData.first_name} onChange={handleChange} />
                   </div>
                   <div style={{flex: 1}}>
                      <label style={{display:'block', marginBottom:'8px', fontWeight:'500'}}>العائلة</label>
                      <input type="text" className="form-control" name="last_name" value={profileData.last_name} onChange={handleChange} />
                   </div>
                </div>
                
                <div style={{marginBottom: '15px'}}>
                   <label style={{display:'block', marginBottom:'8px', fontWeight:'500'}}>معرف الدخول (مرتبط بالنظام)</label>
                   <input type="text" className="form-control" value={profileData.username} disabled style={{backgroundColor: '#F8FAFC', color: '#94A3B8'}} />
                </div>

                <div style={{marginBottom: '25px'}}>
                   <label style={{display:'block', marginBottom:'8px', fontWeight:'500'}}>البريد الإلكتروني</label>
                   <input type="email" className="form-control" name="email" value={profileData.email} onChange={handleChange} placeholder="example@system.org" />
                </div>

                <button type="submit" className="btn-primary" disabled={isSaving} style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                  {isSaving ? <Loader className="spin" size={18} /> : <Save size={18} />}
                  {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
                <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 style={{borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '20px'}}>تغيير كلمة المرور</h2>
              <form onSubmit={handleSave}>
                <div style={{marginBottom: '15px'}}>
                   <label style={{display:'block', marginBottom:'8px', fontWeight:'500'}}>كلمة المرور الحالية</label>
                   <input type="password" className="form-control" />
                </div>
                <div style={{marginBottom: '15px'}}>
                   <label style={{display:'block', marginBottom:'8px', fontWeight:'500'}}>كلمة المرور الجديدة</label>
                   <input type="password" className="form-control" />
                </div>
                <div style={{marginBottom: '25px'}}>
                   <label style={{display:'block', marginBottom:'8px', fontWeight:'500'}}>تأكيد المرور الجديدة</label>
                   <input type="password" className="form-control" />
                </div>
                <button type="submit" className="btn-primary" style={{display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: 'var(--status-warning)', color: 'white', border: 'none'}}>
                  <Lock size={18} /> تحديث كلمة المرور
                </button>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 style={{borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '20px'}}>تفضيلات التنبيهات</h2>
              <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                 <label style={{display:'flex', alignItems:'center', gap:'10px', cursor:'pointer'}}>
                    <input type="checkbox" defaultChecked style={{width:'18px', height:'18px'}}/>
                    <span>إرسال إشعار بريدي عند تسجيل شكوى طارئة.</span>
                 </label>
                 <label style={{display:'flex', alignItems:'center', gap:'10px', cursor:'pointer'}}>
                    <input type="checkbox" defaultChecked style={{width:'18px', height:'18px'}}/>
                    <span>إرسال تنبيه في اللوحة عند تغيير حالة شكوى تابعة لي.</span>
                 </label>
              </div>

              <div style={{marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--border-color)'}}>
                <h3 style={{marginBottom: '12px', fontSize: '1rem', color: 'var(--dark-navy)'}}>المظهر</h3>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: isDark ? '#1e293b' : '#F8FAFC', borderRadius: '12px', border: '1px solid var(--border-color)'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <span style={{fontSize: '1.5rem'}}>{isDark ? '🌙' : '☀️'}</span>
                    <div>
                      <div style={{fontWeight: '600', color: 'var(--text-main)'}}>{isDark ? 'الوضع الليلي مفعّل' : 'الوضع النهاري مفعّل'}</div>
                      <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>اضغط للتبديل بين الوضعين</div>
                    </div>
                  </div>
                  <button
                    onClick={toggleDarkMode}
                    style={{
                      width: '52px', height: '28px', borderRadius: '14px',
                      background: isDark ? 'var(--primary-blue)' : '#e2e8f0',
                      border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.3s'
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: '3px',
                      right: isDark ? '3px' : '27px',
                      width: '22px', height: '22px', borderRadius: '50%',
                      backgroundColor: 'white', transition: 'right 0.3s',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                    }} />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default Settings;
