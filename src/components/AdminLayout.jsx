import React, { useContext, useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, User, BarChart2, LogOut, Settings, Bell, Search, Hexagon } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Logo from './Logo';
import './Layout.css';

const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);

  const fetchNotifs = () => {
    const token = localStorage.getItem('access_token');
    fetch('http://127.0.0.1:8000/api/notifications/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setNotifications(data);
      })
      .catch(e => console.error(e));
  };

  useEffect(() => {
    fetchNotifs();
    // Refresh notifications every 15 seconds
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllRead = () => {
    const token = localStorage.getItem('access_token');
    fetch('http://127.0.0.1:8000/api/notifications/mark_all_read/', { 
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(() => fetchNotifs());
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifRef]);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickProfileOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickProfileOutside);
    return () => document.removeEventListener('mousedown', handleClickProfileOutside);
  }, [profileRef]);

  // Global Search Logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      const token = localStorage.getItem('access_token');
      fetch(`http://127.0.0.1:8000/api/complaints/?search=${searchQuery}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setSearchResults(Array.isArray(data) ? data.slice(0, 5) : []);
          setShowSearchResults(true);
          setIsSearching(false);
        })
        .catch(() => setIsSearching(false));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search results on outside click
  useEffect(() => {
    const handleClickSearchOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickSearchOutside);
    return () => document.removeEventListener('mousedown', handleClickSearchOutside);
  }, [searchRef]);

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header" style={{gap: '12px', padding: '20px 24px', cursor: 'pointer'}} onClick={() => navigate('/admin')}>
          <Logo size={36} />
          <h2 style={{fontSize: '1.15rem'}}>نظام شكوتي (الإدارة)</h2>
        </div>
        
        <nav className="sidebar-nav">
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <li>
              <NavLink to="/admin" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} end>
                <LayoutDashboard size={20} />
                <span>لوحة التحكم الرئيسية</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/reports" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
                <BarChart2 size={20} />
                <span>التقارير الشاملة</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/users" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
                <Users size={20} />
                <span>إدارة الباحثين</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/admin/settings" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} style={{width: '100%', background: 'transparent', border: 'none', textAlign: 'right', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center'}}>
            <Settings size={20} />
            <span>إعدادات النظام</span>
          </NavLink>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb" style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem'}}>
            <span 
              className="breadcrumb-item" 
              onClick={() => navigate('/admin')} 
              style={{cursor: 'pointer', color: 'var(--text-secondary)'}}
            >نظام شكوتي</span>
            <span className="breadcrumb-separator" style={{color: '#cbd5e1'}}>/</span>
            <span className="breadcrumb-active" style={{fontWeight: '600', color: 'var(--primary-blue)'}}>لوحة التحكم (الإدارة)</span>
          </div>

          <div className="search-bar" ref={searchRef} style={{ position: 'relative' }}>
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="بحث سريع (رقم الشكوى، اسم المشتكي)..." 
              className="search-input" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowSearchResults(true)}
            />
            
            {showSearchResults && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, 
                marginTop: '8px', backgroundColor: 'white', borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 2000, 
                border: '1px solid var(--border-color)', overflow: 'hidden'
              }}>
                <div style={{ padding: '10px 15px', backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  نتائج البحث ({searchResults.length})
                </div>
                {searchResults.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {isSearching ? 'جاري البحث...' : 'لا توجد نتائج مطابقة'}
                  </div>
                ) : (
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {searchResults.map(c => (
                      <div 
                        key={c.id} 
                        onClick={() => {
                          setShowSearchResults(false);
                          setSearchQuery('');
                          navigate(`/complaint/${c.id}`);
                        }}
                        style={{ 
                          padding: '12px 15px', borderBottom: '1px solid #F1F5F9', 
                          cursor: 'pointer', transition: 'background 0.2s' 
                        }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '600', color: 'var(--primary-blue)', fontSize: '0.85rem' }}>{c.complaint_number}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.status === 'PENDING' ? 'قيد الانتظار' : 'محدثة'}</span>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', textAlign: 'right' }}>{c.complainant_name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="topbar-actions">
            
             <div className="icon-btn" style={{position: 'relative', cursor: 'pointer'}} onClick={() => setShowNotifications(!showNotifications)} ref={notifRef}>
              <Bell size={20} className={unreadCount > 0 ? "pulse-bell" : ""} />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              <style>{`
                @keyframes pulse-bell {
                  0% { transform: scale(1); }
                  50% { transform: scale(1.1); color: #EF4444; }
                  100% { transform: scale(1); }
                }
                .pulse-bell { animation: pulse-bell 2s infinite; }
              `}</style>
              
              {showNotifications && (
                <div style={{
                  position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', 
                  marginTop: '10px', width: '320px', 
                  backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', 
                  zIndex: 1000, overflow: 'hidden', border: '1px solid var(--border-color)',
                  cursor: 'default', textAlign: 'right'
                }}>
                  <div style={{padding: '15px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h3 style={{margin: 0, fontSize: '1rem', color: 'var(--primary-blue)'}}>الإشعارات العاجلة</h3>
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

            <div className="user-profile-wrapper" ref={profileRef} style={{position: 'relative'}}>
              <div 
                className="user-profile" 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{cursor: 'pointer'}}
              >
                <div className="avatar" style={{overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                  ) : (
                    user?.first_name ? user.first_name[0] : 'U'
                  )}
                </div>
                <div className="user-info">
                  <span className="user-name">{user ? `${user.first_name} ${user.last_name}` : 'إدارة النظام'}</span>
                  <span className="user-role">{"مدير مؤسسة"}</span>
                </div>
              </div>

              {showProfileMenu && (
                <div style={{
                  position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', 
                  marginTop: '10px', width: '200px',
                  backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  zIndex: 1000, border: '1px solid var(--border-color)', overflow: 'hidden'
                }}>
                  <button onClick={() => { setShowProfileMenu(false); navigate('/admin/settings'); }} style={{width: '100%', padding: '12px 15px', display: 'flex', gap: '10px', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', textAlign: 'right'}}>
                    <User size={16} /> الملف الشخصي
                  </button>
                  <button onClick={logout} style={{width: '100%', padding: '12px 15px', display: 'flex', gap: '10px', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', textAlign: 'right'}}>
                    <LogOut size={16} /> تسجيل الخروج
                  </button>
                </div>
              )}
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

export default AdminLayout;
