'use client';

import React from 'react';
import { Menu, Search, Bell, GraduationCap } from 'lucide-react';

interface MobileTopHeaderProps {
  onOpenDrawer: () => void;
  onToggleSearch: () => void;
  onOpenNotifications: () => void;
}

export const MobileTopHeader: React.FC<MobileTopHeaderProps> = ({
  onOpenDrawer,
  onToggleSearch,
  onOpenNotifications,
}) => {
  return (
    <div className="mobile-top-header">
      {/* Hamburger */}
      <button
        style={{ padding: '6px', color: '#0F172A', display: 'flex' }}
        onClick={onOpenDrawer}
        aria-label="Open Navigation Menu"
      >
        <Menu size={22} />
      </button>

      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
          }}
        >
          <GraduationCap size={16} />
        </div>
        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
          CampusConnect
        </span>
      </div>

      {/* Right Icons: Search & Bell */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          style={{ padding: '6px', color: '#475569', display: 'flex' }}
          onClick={onToggleSearch}
          aria-label="Search"
        >
          <Search size={20} />
        </button>
        <button
          style={{ padding: '6px', color: '#475569', display: 'flex', position: 'relative' }}
          onClick={onOpenNotifications}
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              borderRadius: '999px',
              background: '#EF4444',
            }}
          />
        </button>
      </div>
    </div>
  );
};
