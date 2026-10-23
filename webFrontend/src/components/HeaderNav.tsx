'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Bell, ChevronDown, User, LogOut, ShieldCheck, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderNavProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenNotifications?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  searchQuery,
  onSearchChange,
  onOpenNotifications,
}) => {
  const { user, role, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="top-header">
      {/* Search Input Bar */}
      <div className="search-bar-wrapper">
        <Search size={18} className="search-icon-inside" />
        <input
          type="text"
          className="search-bar-input"
          placeholder="Search for societies, events, members..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Right Actions */}
      <div className="header-right-actions">
        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            className="icon-btn"
            title="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={18} />
            <span className="notification-badge">1</span>
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '48px',
                right: '0',
                width: '300px',
                background: '#FFFFFF',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-light)',
                padding: '16px',
                zIndex: 60,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}
              >
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700 }}>Notifications</h4>
                <span style={{ fontSize: '0.7rem', color: 'var(--primary)', cursor: 'pointer' }}>
                  Mark all as read
                </span>
              </div>
              <div
                style={{
                  padding: '10px',
                  background: '#F8FAFC',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  fontSize: '0.78rem',
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '2px' }}>
                  🎉 Application Shortlisted
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  Your application for ACM Web Development has been shortlisted!
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  10 minutes ago
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div style={{ position: 'relative' }}>
          <div
            className="user-profile-pill"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.fullName || user.clubName || 'User'}
                className="user-avatar-img"
              />
            ) : (
              <div
                className="user-avatar-img"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--primary-gradient)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                }}
              >
                {(user?.fullName || user?.clubName || 'U').slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="user-info-text">
              <div className="user-name">{user?.fullName || user?.clubName || (role === 'admin' ? 'Administrator' : 'User')}</div>
              <div className="user-role-label">
                {role === 'club' ? 'Club Lead' : role === 'admin' ? 'Admin' : 'Student'}
              </div>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </div>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                top: '48px',
                right: '0',
                width: '220px',
                background: '#FFFFFF',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-light)',
                padding: '8px',
                zIndex: 60,
              }}
            >
              <div
                style={{
                  padding: '10px 14px',
                  borderBottom: '1px solid #F1F5F9',
                  marginBottom: '6px',
                }}
              >
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {user?.fullName || 'User'}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {user?.email || ''}
                </div>
                <span
                  style={{
                    display: 'inline-block',
                    marginTop: '6px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: role === 'club' ? '#ECFDF5' : role === 'admin' ? '#FEF2F2' : '#EEF2FF',
                    color: role === 'club' ? '#059669' : role === 'admin' ? '#DC2626' : 'var(--primary)',
                  }}
                >
                  {role === 'club' ? 'Club Lead' : role === 'admin' ? 'Administrator' : 'Student'}
                </span>
              </div>

              <Link
                href="/settings"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                }}
                onClick={() => setShowProfileMenu(false)}
              >
                <User size={15} /> My Profile & Settings
              </Link>

              <div style={{ borderTop: '1px solid #F1F5F9', margin: '4px 0' }} />

              <button
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#EF4444',
                }}
                onClick={() => {
                  logout();
                  setShowProfileMenu(false);
                }}
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
