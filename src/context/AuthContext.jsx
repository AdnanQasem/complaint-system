import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  // Try to refresh the access token using the refresh token
  const refreshAccessToken = useCallback(async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) return null;
    try {
      const res = await fetch('http://127.0.0.1:8000/api/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('access_token', data.access);
        return data.access;
      }
    } catch (e) {
      console.error('Token refresh failed', e);
    }
    return null;
  }, []);

  // Authenticated fetch wrapper — auto-refreshes on 401
  const authFetch = useCallback(async (url, options = {}) => {
    let token = localStorage.getItem('access_token');
    const makeRequest = (tkn) => fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        'Authorization': `Bearer ${tkn}`
      }
    });

    let res = await makeRequest(token);
    if (res.status === 401) {
      // Try to refresh
      const newToken = await refreshAccessToken();
      if (newToken) {
        res = await makeRequest(newToken);
      } else {
        logout();
        throw new Error('Session expired');
      }
    }
    return res;
  }, [refreshAccessToken, logout]);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await fetch('http://127.0.0.1:8000/api/auth/me/', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setUser(data);
          } else if (response.status === 401) {
            // Try refresh before giving up
            const newToken = await refreshAccessToken();
            if (newToken) {
              const retry = await fetch('http://127.0.0.1:8000/api/auth/me/', {
                headers: { 'Authorization': `Bearer ${newToken}` }
              });
              if (retry.ok) {
                setUser(await retry.json());
              } else {
                logout();
              }
            } else {
              logout();
            }
          }
        } catch (error) {
          console.error('Error verifying token', error);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (username, password) => {
    const response = await fetch('http://127.0.0.1:8000/api/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);

      const profileRes = await fetch('http://127.0.0.1:8000/api/auth/me/', {
        headers: { 'Authorization': `Bearer ${data.access}` }
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setUser(profileData);
        return { success: true, role: profileData.role };
      }
    }
    return { success: false };
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading, authFetch }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
