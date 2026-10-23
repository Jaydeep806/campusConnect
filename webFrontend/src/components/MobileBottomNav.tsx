'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Shield, Calendar, Briefcase, User, FileCheck2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MobileBottomNavProps {
  onOpenProfile?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenProfile }) => {
  const pathname = usePathname();
  const { role } = useAuth();

  return (
    <nav className="mobile-bottom-nav">
      <Link href="/" className={`mobile-nav-item ${pathname === '/' ? 'active' : ''}`}>
        <Home size={20} />
        <span>Home</span>
      </Link>

      <Link
        href="/societies"
        className={`mobile-nav-item ${pathname.startsWith('/societies') ? 'active' : ''}`}
      >
        <Shield size={20} />
        <span>{role === 'admin' ? 'Clubs' : 'Societies'}</span>
      </Link>

      <Link
        href="/events"
        className={`mobile-nav-item ${pathname.startsWith('/events') ? 'active' : ''}`}
      >
        <Calendar size={20} />
        <span>Events</span>
      </Link>

      {role === 'club' ? (
        <Link
          href="/applications"
          className={`mobile-nav-item ${pathname.startsWith('/applications') ? 'active' : ''}`}
        >
          <FileCheck2 size={20} />
          <span>Review</span>
        </Link>
      ) : (
        <Link
          href="/applications"
          className={`mobile-nav-item ${pathname.startsWith('/applications') ? 'active' : ''}`}
        >
          <FileCheck2 size={20} />
          <span>Applications</span>
        </Link>
      )}

      <button
        className="mobile-nav-item"
        onClick={() => onOpenProfile && onOpenProfile()}
        style={{ background: 'none', border: 'none' }}
      >
        <User size={20} />
        <span>Profile</span>
      </button>
    </nav>
  );
};
