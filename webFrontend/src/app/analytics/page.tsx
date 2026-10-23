'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '../../components/Sidebar';
import { HeaderNav } from '../../components/HeaderNav';
import { MobileTopHeader } from '../../components/MobileTopHeader';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import { MobileDrawer } from '../../components/MobileDrawer';
import { ArrowLeft, TrendingUp, Users, Calendar, Award, Briefcase } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AnalyticsPage() {
  const { role } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [stats, setStats] = useState({
    membersCount: 0,
    eventsCount: 0,
    applicationsCount: 0,
    societiesCount: 0,
    openRecruitmentsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [role]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      if (role === 'club') {
        const clubDash = await api.getClubDashboard();
        setStats({
          membersCount: clubDash.stats?.totalMembers || 0,
          eventsCount: clubDash.stats?.upcomingEvents || 0,
          applicationsCount: clubDash.stats?.applications || 0,
          societiesCount: 1,
          openRecruitmentsCount: clubDash.stats?.openRecruitments || 0,
        });
      } else {
        const [socs, evs, recs] = await Promise.all([
          api.getSocieties(),
          api.getEvents('all'),
          api.getRecruitments(),
        ]);
        const totalMembers = socs.reduce((acc, s) => acc + (s.memberCount || 0), 0);
        setStats({
          membersCount: totalMembers,
          eventsCount: evs.length,
          applicationsCount: recs.length * 15, // estimated campus applications
          societiesCount: socs.length,
          openRecruitmentsCount: recs.length,
        });
      }
    } catch (err) {
      console.warn('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeSection="analytics" />
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      <div className="main-layout">
        <HeaderNav searchQuery="" onSearchChange={() => {}} />
        <MobileTopHeader
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onToggleSearch={() => {}}
          onOpenNotifications={() => {}}
        />

        <main style={{ padding: '28px', maxWidth: '1280px', width: '100%' }}>
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
              {role === 'club' ? 'Club Performance & Growth Analytics' : 'Campus Engagement Analytics'}
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Real-time student participation trends, recruitment rates, and event attendance metrics.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Active Members</span>
                <Users size={18} color="var(--primary)" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px' }}>
                {loading ? '...' : `${stats.membersCount}+`}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#10B981', marginTop: '4px' }}>Verified student roster</div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Events Hosted</span>
                <Calendar size={18} color="#8B5CF6" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px' }}>
                {loading ? '...' : stats.eventsCount}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#10B981', marginTop: '4px' }}>Published sessions</div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  {role === 'club' ? 'Candidate Applications' : 'Recruitment Drives'}
                </span>
                <Briefcase size={18} color="#3B82F6" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px' }}>
                {loading ? '...' : (role === 'club' ? stats.applicationsCount : stats.openRecruitmentsCount)}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#3B82F6', marginTop: '4px' }}>Recruitment Season 2026</div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Approved Societies</span>
                <Award size={18} color="#F59E0B" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px' }}>
                {loading ? '...' : stats.societiesCount}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>SAC Recognized</div>
            </div>
          </div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
