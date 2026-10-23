'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '../../components/Sidebar';
import { HeaderNav } from '../../components/HeaderNav';
import { MobileTopHeader } from '../../components/MobileTopHeader';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import { MobileDrawer } from '../../components/MobileDrawer';
import { CategoryFilters } from '../../components/CategoryFilters';
import { ApplicationModal } from '../../components/ApplicationModal';
import { SocietyItem } from '../../types';
import { api } from '../../services/api';
import { ArrowLeft, Users, ExternalLink, CheckCircle2, Search } from 'lucide-react';

export default function SocietiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [societies, setSocieties] = useState<SocietyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedSocietyForApply, setSelectedSocietyForApply] = useState<SocietyItem | null>(null);

  useEffect(() => {
    loadSocieties();
  }, [selectedCategory, searchQuery]);

  const loadSocieties = async () => {
    setLoading(true);
    try {
      const data = await api.getSocieties(selectedCategory, searchQuery);
      setSocieties(data);
    } catch (err) {
      console.warn('Error loading societies:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeSection="societies" />
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      <div className="main-layout">
        <HeaderNav searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <MobileTopHeader
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onToggleSearch={() => {}}
          onOpenNotifications={() => {}}
        />

        <main style={{ padding: '28px', maxWidth: '1280px', width: '100%' }}>
          <div style={{ marginBottom: '20px' }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                marginBottom: '12px',
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to Dashboard</span>
            </Link>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Campus Societies & Clubs
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Explore official campus clubs, check open positions, and connect with student leaders.
            </p>
          </div>

          <CategoryFilters
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>Loading official societies...</div>
            </div>
          ) : societies.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Search size={40} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>No societies found</div>
              <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Try selecting another category or clear the search query.</p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '20px',
                marginTop: '24px',
              }}
            >
              {societies.map((soc) => (
                <div
                  key={soc.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid var(--border-light)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ height: '110px', background: '#0F172A', position: 'relative' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={soc.bannerUrl || '/images/campus_banner.jpg'}
                      alt={soc.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        padding: '4px 10px',
                        background: 'rgba(15, 23, 42, 0.75)',
                        color: '#FFFFFF',
                        borderRadius: '999px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                      }}
                    >
                      {soc.category}
                    </span>
                  </div>

                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '999px',
                          background: soc.logoBg || '#0F172A',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                        }}
                      >
                        {soc.logoText || soc.name.slice(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>{soc.name}</span>
                          {soc.verified && <CheckCircle2 size={16} fill="#3B82F6" color="#FFFFFF" />}
                        </h3>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Est. {soc.foundedYear} • {soc.memberCount}+ Members
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1, marginBottom: '14px' }}>
                      {soc.about}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                      <span style={{ fontSize: '0.72rem', color: soc.hasOpenRecruitment ? 'var(--color-green)' : 'var(--text-muted)', fontWeight: 700 }}>
                        {soc.hasOpenRecruitment ? '● Hiring Active' : '○ Closed for now'}
                      </span>

                      <button
                        className="apply-btn-primary"
                        style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                        onClick={() => setSelectedSocietyForApply(soc)}
                      >
                        Apply / Join
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <MobileBottomNav />

      {selectedSocietyForApply && (
        <ApplicationModal
          society={selectedSocietyForApply}
          onClose={() => setSelectedSocietyForApply(null)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}
