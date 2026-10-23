'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserProfile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  role: UserRole;
  user: UserProfile | null;
  isAuthenticated: boolean;
  hasStarted: boolean;
  accessToken: string | null;
  setHasStarted: (val: boolean) => void;
  loginAsStudent: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  loginAsClub: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  loginAsAdmin: (id: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  registerStudent: (data: any) => Promise<{ success: boolean; message?: string }>;
  registerClub: (data: any) => Promise<{ success: boolean; message?: string }>;
  switchDemoRole: (role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  role: 'guest',
  user: null,
  isAuthenticated: false,
  hasStarted: false,
  accessToken: null,
  setHasStarted: () => {},
  loginAsStudent: async () => ({ success: false }),
  loginAsClub: async () => ({ success: false }),
  loginAsAdmin: async () => ({ success: false }),
  registerStudent: async () => ({ success: false }),
  registerClub: async () => ({ success: false }),
  switchDemoRole: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [role, setRole] = useState<UserRole>('guest');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('cc_user');
      const savedRole = localStorage.getItem('cc_role') as UserRole | null;
      const savedToken = localStorage.getItem('cc_access_token');
      const savedStarted = localStorage.getItem('cc_has_started');
      if (savedStarted === 'true') {
        setHasStarted(true);
      }
      if (savedUser && savedRole && savedToken) {
        setUser(JSON.parse(savedUser));
        setRole(savedRole);
        setIsAuthenticated(true);
        setAccessToken(savedToken);
        api.setTokens(savedToken, localStorage.getItem('cc_refresh_token'));

        // Verify with backend
        api.getMe().then((res) => {
          if (res?.user) {
            setUser(res.user);
            localStorage.setItem('cc_user', JSON.stringify(res.user));
          }
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('Error reading saved user session:', e);
    }
  }, []);

  const saveSession = (
    newUser: UserProfile | null,
    newRole: UserRole,
    token: string | null,
    refreshToken?: string | null
  ) => {
    setUser(newUser);
    setRole(newRole);
    setAccessToken(token);
    setIsAuthenticated(Boolean(newUser));
    api.setTokens(token, refreshToken ?? null);
    if (typeof window !== 'undefined') {
      if (newUser) {
        localStorage.setItem('cc_user', JSON.stringify(newUser));
        localStorage.setItem('cc_role', newRole);
        localStorage.setItem('cc_has_started', 'true');
        setHasStarted(true);
      } else {
        localStorage.removeItem('cc_user');
        localStorage.removeItem('cc_role');
        localStorage.removeItem('cc_access_token');
        localStorage.removeItem('cc_refresh_token');
        localStorage.removeItem('cc_has_started');
      }
    }
  };

  const loginAsStudent = async (email: string, pass: string) => {
    try {
      const res = await api.studentLogin(email, pass);
      const studentUser: UserProfile = res.user;
      saveSession(studentUser, 'student', res.accessToken, res.refreshToken);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Login failed' };
    }
  };

  const loginAsClub = async (email: string, pass: string) => {
    try {
      const res = await api.clubLogin(email, pass);
      const clubUser: UserProfile = res.user;
      saveSession(clubUser, 'club', res.accessToken, res.refreshToken);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Club login failed' };
    }
  };

  const loginAsAdmin = async (id: string, pass: string) => {
    try {
      const res = await api.adminLogin(id, pass);
      const adminUser: UserProfile = {
        id: res.user?.id || id,
        role: 'admin',
        fullName: 'Campus Administrator',
        email: 'admin@campusconnect.edu',
      };
      saveSession(adminUser, 'admin', res.accessToken, res.refreshToken);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Admin login failed' };
    }
  };

  const registerStudent = async (data: any) => {
    try {
      const res = await api.studentRegister(data);
      if (res.user) {
        saveSession(res.user, 'student', res.accessToken || null, res.refreshToken || null);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Registration failed' };
    }
  };

  const registerClub = async (data: any) => {
    try {
      const res = await api.clubRegister(data);
      return { success: true, message: res.message || 'Application submitted' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Registration failed' };
    }
  };

  const switchDemoRole = async (newRole: UserRole) => {
    if (newRole === 'student') {
      await loginAsStudent('sam@example.edu', 'password123');
    } else if (newRole === 'club') {
      await loginAsClub('acm@example.edu', 'password123');
    } else if (newRole === 'admin') {
      await loginAsAdmin('campus-admin', 'adminPassword123!');
    } else {
      logout();
    }
  };

  const logout = () => {
    try {
      api.logout();
    } catch (e) {
      console.warn('Error during logout:', e);
    }
    saveSession(null, 'guest', null, null);
    setHasStarted(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cc_user');
      localStorage.removeItem('cc_role');
      localStorage.removeItem('cc_access_token');
      localStorage.removeItem('cc_refresh_token');
      localStorage.removeItem('cc_has_started');
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        user,
        isAuthenticated,
        hasStarted,
        accessToken,
        setHasStarted,
        loginAsStudent,
        loginAsClub,
        loginAsAdmin,
        registerStudent,
        registerClub,
        switchDemoRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
