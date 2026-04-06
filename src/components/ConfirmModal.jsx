import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "هل أنت متأكد؟", 
  message = "لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.",
  confirmText = "نعم، متأكد",
  cancelText = "إلغاء",
  type = "danger" 
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 10000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '400px',
        padding: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        position: 'relative',
        textAlign: 'center',
        direction: 'rtl',
        fontFamily: 'Tajawal, sans-serif'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', left: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
        >
          <X size={20} />
        </button>

        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          backgroundColor: type === 'danger' ? '#FEF2F2' : '#EFF6FF',
          color: type === 'danger' ? '#EF4444' : '#3B82F6',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <AlertCircle size={32} />
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>{title}</h3>
        <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '24px' }}>{message}</p>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={onConfirm}
            style={{
              flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
              backgroundColor: type === 'danger' ? '#EF4444' : '#3B82F6',
              color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem'
            }}
          >
            {confirmText}
          </button>
          <button 
            onClick={onClose}
            style={{
              flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0',
              backgroundColor: 'white', color: '#64748b', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem'
            }}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
