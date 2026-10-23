'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
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
  Megaphone,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  onNavigateTab?: (tab: string) => void;
  activeSection?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigateTab, activeSection }) => {
  const pathname = usePathname();
  const { role } = useAuth();

  // Role-specific navigation items matching the React Native app permissions
  const navItems =
    role === 'club'
      ? [
          { id: 'dashboard', label: 'Club Dashboard', href: '/', icon: LayoutDashboard },
          { id: 'applications', label: 'Candidate Review', href: '/applications', icon: FileCheck2 },
          { id: 'recruitment', label: 'Hiring Drives', href: '/recruitment', icon: Briefcase },
          { id: 'events', label: 'Club Events', href: '/events', icon: Calendar },
          { id: 'members', label: 'Member Roster', href: '/members', icon: Users },
          { id: 'analytics', label: 'Club Analytics', href: '/analytics', icon: BarChart2 },
          { id: 'settings', label: 'Settings', href: '/settings', icon: Settings },
        ]
      : role === 'admin'
      ? [
          { id: 'dashboard', label: 'Admin Dashboard', href: '/', icon: LayoutDashboard },
          { id: 'societies', label: 'Clubs Directory', href: '/societies', icon: Shield },
          { id: 'analytics', label: 'Campus Analytics', href: '/analytics', icon: BarChart2 },
          { id: 'announcements', label: 'Notices', href: '/announcements', icon: Megaphone },
          { id: 'settings', label: 'Settings', href: '/settings', icon: Settings },
        ]
      : [
          /* STUDENT NAVIGATION (Strictly Student Discovery & Participation) */
          { id: 'dashboard', label: 'Dashboard', href: '/', icon: LayoutDashboard },
          { id: 'societies', label: 'Explore Societies', href: '/societies', icon: Shield },
          { id: 'events', label: 'Events & Workshops', href: '/events', icon: Calendar },
          { id: 'applications', label: 'My Applications', href: '/applications', icon: FileCheck2 },
          { id: 'announcements', label: 'Announcements', href: '/announcements', icon: Megaphone },
          { id: 'faq', label: 'About / FAQ', href: '/faq', icon: HelpCircle },
          { id: 'settings', label: 'Settings', href: '/settings', icon: Settings },
        ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <Link href="/" className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <GraduationCap size={20} />
        </div>
        <span>CampusConnect</span>
      </Link>

      {/* Role Tag */}
      <div style={{ padding: '0 8px 12px 8px' }}>
        <span
          style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: role === 'club' ? '#059669' : role === 'admin' ? '#DC2626' : 'var(--primary)',
            background: role === 'club' ? '#ECFDF5' : role === 'admin' ? '#FEF2F2' : '#EEF2FF',
            padding: '3px 8px',
            borderRadius: '999px',
          }}
        >
          {role === 'club' ? 'Club Lead Portal' : role === 'admin' ? 'SAC Admin Portal' : 'Student Portal'}
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeSection === item.id ||
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => onNavigateTab && onNavigateTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Promo Bottom Card */}
      <div className="sidebar-promo-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/campus_cartoon_bg.jpg"
          alt="CampusConnect Community"
          className="sidebar-promo-img"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <h4 className="sidebar-promo-title">CampusConnect</h4>
        <p className="sidebar-promo-sub">Explore • Join • Build • Grow</p>
      </div>
    </aside>
  );
};
