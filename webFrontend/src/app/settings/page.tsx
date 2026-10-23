'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '../../components/Sidebar';
import { HeaderNav } from '../../components/HeaderNav';
import { MobileTopHeader } from '../../components/MobileTopHeader';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import { MobileDrawer } from '../../components/MobileDrawer';
import { ArrowLeft, Bell, Lock, User, Shield, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SettingsPage() {
  const { user, role, logout } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [appNotifs, setAppNotifs] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="app-container">
      <Sidebar activeSection="settings" />
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      <div className="main-layout">
        <HeaderNav searchQuery="" onSearchChange={() => {}} />
        <MobileTopHeader
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onToggleSearch={() => {}}
          onOpenNotifications={() => {}}
        />

        <main style={{ padding: '28px', maxWidth: '800px', width: '100%' }}>
          <div style={{ marginBottom: '24px' }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                marginBottom: '10px',
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to Dashboard</span>
            </Link>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Account & Preference Settings
            </h1>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Notifications */}
            <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Bell size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Notification Preferences</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={emailNotifs}
                    onChange={(e) => setEmailNotifs(e.target.checked)}
                    style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                  />
                  <span>Email notifications for application interview updates</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={appNotifs}
                    onChange={(e) => setAppNotifs(e.target.checked)}
                    style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                  />
                  <span>Campus event reminders and announcements</span>
                </label>
              </div>
            </div>

            {/* Account Details */}
            <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Shield size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Account & Role</h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Signed in as: <strong>{user?.fullName}</strong> ({user?.email})
              </p>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Role: <strong style={{ color: 'var(--primary)', textTransform: 'capitalize' }}>{role}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="submit-btn"
                style={{ width: 'auto', padding: '10px 24px' }}
                onClick={handleSave}
              >
                {saved ? '✓ Settings Saved!' : 'Save Preferences'}
              </button>

              <button
                type="button"
                onClick={logout}
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  background: '#FEF2F2',
                  color: '#DC2626',
                  border: '1px solid #FECACA',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
