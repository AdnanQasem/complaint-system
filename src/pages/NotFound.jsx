import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      fontFamily: 'Tajawal, sans-serif',
      direction: 'rtl',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '60px 48px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
        maxWidth: '480px',
        width: '100%'
      }}>
        <div style={{
          width: '80px', height: '80px',
          backgroundColor: '#FEF2F2', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <AlertCircle size={40} color="#EF4444" />
        </div>

        <div style={{
          fontSize: '5rem', fontWeight: '900',
          background: 'linear-gradient(135deg, #112E51, #1D70B8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1,
          marginBottom: '16px'
        }}>
          404
        </div>

        <h1 style={{ fontSize: '1.5rem', color: '#1e293b', marginBottom: '12px', fontWeight: '700' }}>
          الصفحة غير موجودة
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.6', marginBottom: '32px' }}>
          عذراً، الصفحة التي تبحث عنها غير موجودة أو ربما تم نقلها أو حذفها.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '12px 24px', borderRadius: '10px',
              border: '1px solid #e2e8f0', background: 'white',
              color: '#64748b', cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
              fontWeight: '600', fontSize: '0.95rem'
            }}
          >
            رجوع
          </button>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 24px', borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #112E51, #1D70B8)',
              color: 'white', cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
              fontWeight: '600', fontSize: '0.95rem',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <Home size={18} /> الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
