'use client';

import React from 'react';
import Link from 'next/link';
import {
  X,
  LayoutDashboard,
  Shield,
  Calendar,
  Briefcase,
  FileCheck2,
  Users,
  BarChart2,
  MessageSquare,
  Settings,
  GraduationCap,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { id: 'societies', label: 'Societies', href: '/societies', icon: Shield },
  { id: 'events', label: 'Events', href: '/events', icon: Calendar },
  { id: 'recruitment', label: 'Recruitment', href: '/recruitment', icon: Briefcase },
  { id: 'applications', label: 'Applications', href: '/applications', icon: FileCheck2 },
  { id: 'members', label: 'Members', href: '/members', icon: Users },
  { id: 'analytics', label: 'Analytics', href: '/analytics', icon: BarChart2 },
  { id: 'messages', label: 'Messages', href: '/messages', icon: MessageSquare },
  { id: 'settings', label: 'Settings', href: '/settings', icon: Settings },
];

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const { user, role, logout } = useAuth();

  if (!isOpen) return null;

  return (
    <>
      <div className="mobile-drawer-backdrop" onClick={onClose} />
      <div className="mobile-drawer">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <GraduationCap size={18} />
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>CampusConnect</span>
          </div>
          <button onClick={onClose} style={{ padding: '6px', color: '#64748B' }}>
            <X size={20} />
          </button>
        </div>

        {/* User Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            background: '#F8FAFC',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            marginBottom: '16px',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              user?.avatarUrl ||
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
            }
            alt={user?.fullName || 'User'}
            style={{ width: '40px', height: '40px', borderRadius: '999px', objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
              {user?.fullName || user?.clubName || (role === 'admin' ? 'Administrator' : 'User')}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
              {role === 'club' ? 'Club Lead' : role === 'admin' ? 'Admin' : 'Student'}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: '#475569',
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Sign Out Button */}
        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '12px', marginTop: '12px' }}>
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: '10px',
              fontSize: '0.82rem',
              fontWeight: 700,
              background: '#FEF2F2',
              color: '#DC2626',
              border: '1px solid #FECACA',
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};
