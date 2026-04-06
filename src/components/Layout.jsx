import React, { useContext, useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, PlusCircle, Users, LogOut, Settings, Bell, User } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Logo from './Logo';
import './Layout.css';

const Layout = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const fetchNotifs = () => {
    fetch('http://127.0.0.1:8000/api/notifications/')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setNotifications(data);
      })
      .catch(e => console.error(e));
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllRead = () => {
    fetch('http://127.0.0.1:8000/api/notifications/mark_all_read/', { method: 'POST' })
      .then(() => fetchNotifs());
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header" style={{gap: '12px', padding: '20px 24px', cursor: 'pointer'}} onClick={() => navigate('/')}>
          <Logo size={36} />
          <h2 style={{fontSize: '1.15rem'}}>نظام شكوتي</h2>
        </div>
        
        <nav className="sidebar-nav">
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <li>
              <NavLink to="/" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} end>
                <LayoutDashboard size={20} />
                <span>لوحة تحكم الباحث</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/new" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
                <PlusCircle size={20} />
                <span>إدخال شكوى جديدة</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/complaints" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
                <FileText size={20} />
                <span>سجل الشكاوى</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/settings" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} style={{width: '100%', background: 'transparent', border: 'none', textAlign: 'right', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center'}}>
            <Settings size={20} />
            <span>الإعدادات</span>
          </NavLink>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div className="header-breadcrumbs">
            <span 
              onClick={() => navigate('/')} 
              style={{cursor: 'pointer', transition: 'color 0.2s', fontWeight: '500'}} 
              onMouseOver={(e) => e.target.style.color = 'var(--primary-blue)'}
              onMouseOut={(e) => e.target.style.color = 'inherit'}
            >
              نظام شكوتي
            </span> / <span className="active-path">لوحة التحكم</span>
          </div>
          <div className="header-actions">
            
            <div className="icon-wrapper" ref={notifRef} style={{position:'relative'}}>
              <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell size={20} className={unreadCount > 0 ? "pulse-bell" : ""} />
                {unreadCount > 0 && <span className="notification-badge" style={{position: 'absolute', top: '-5px', right: '-5px', width: '18px', height: '18px', backgroundColor: '#EF4444', color: 'white', borderRadius: '50%', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white'}}>{unreadCount}</span>}
                <style>{`
                  @keyframes pulse-bell {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); color: #EF4444; }
                    100% { transform: scale(1); }
                  }
                  .pulse-bell { animation: pulse-bell 2s infinite; }
                `}</style>
              </button>
              
              {showNotifications && (
                <div style={{
                  position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', 
                  marginTop: '10px', width: '320px', 
                  backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', 
                  zIndex: 1000, overflow: 'hidden', border: '1px solid var(--border-color)',
                  cursor: 'default'
                }}>
                  <div style={{padding: '15px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h3 style={{margin: 0, fontSize: '1rem', color: 'var(--primary-blue)'}}>الإشعارات</h3>
                    {unreadCount > 0 && <button onClick={markAllRead} style={{fontSize: '0.8rem', color: '#10B981', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>تحديد كمقروء</button>}
                  </div>
                  <div style={{maxHeight: '300px', overflowY: 'auto'}}>
                    {notifications.length === 0 ? (
                      <p style={{textAlign: 'center', padding: '20px', color: 'var(--text-secondary)'}}>لا يوجد إشعارات جديدة</p>
                    ) : notifications.slice(0, 10).map(n => (
                      <div key={n.id} style={{padding: '12px 15px', borderBottom: '1px solid #f1f5f9', backgroundColor: n.is_read ? 'white' : '#FEF2F2', display: 'flex', flexDirection: 'column', gap: '5px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                          <strong style={{color: n.is_read ? 'var(--text-main)' : 'var(--status-critical)', fontSize: '0.9rem'}}>{n.title}</strong>
                          <span style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>{new Date(n.created_at).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <p style={{margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'right'}}>{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="user-profile" onClick={() => setShowDropdown(!showDropdown)} ref={dropdownRef}>
              <div className="avatar" style={{overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                ) : (
                  user?.first_name ? user.first_name[0] : 'U'
                )}
              </div>
              <span>{user ? `${user.first_name} ${user.last_name} (باحث اجتماعي)` : 'باحث اجتماعي'}</span>
              <div className={`profile-dropdown ${showDropdown ? 'show' : ''}`}>
                <button className="dropdown-item" onClick={() => { setShowDropdown(false); navigate('/settings'); }}>
                  <User size={16} /> الملف الشخصي
                </button>
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <LogOut size={16} /> تسجيل الخروج
                </button>
              </div>
            </div>
          </div>
        </header>
        <div className="page-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
