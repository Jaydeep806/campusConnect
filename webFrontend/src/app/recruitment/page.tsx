'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '../../components/Sidebar';
import { HeaderNav } from '../../components/HeaderNav';
import { MobileTopHeader } from '../../components/MobileTopHeader';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import { MobileDrawer } from '../../components/MobileDrawer';
import { ApplicationModal } from '../../components/ApplicationModal';
import { StartHiringModal } from '../../components/StartHiringModal';
import { EditRecruitmentModal } from '../../components/EditRecruitmentModal';
import { SocietyItem } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, ExternalLink, Briefcase, CheckCircle2, Edit3 } from 'lucide-react';

export default function RecruitmentPage() {
  const { role, user } = useAuth();
  const [recruitments, setRecruitments] = useState<any[]>([]);
  const [societies, setSocieties] = useState<SocietyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSocietyForApply, setSelectedSocietyForApply] = useState<SocietyItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isStartHiringOpen, setIsStartHiringOpen] = useState(false);
  const [editingRecruitment, setEditingRecruitment] = useState<any | null>(null);

  useEffect(() => {
    loadData();
  }, [role]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recs, socs] = await Promise.all([
        role === 'club'
          ? api.getClubRecruitments()
          : role === 'admin'
          ? api.adminGetRecruitments()
          : api.getRecruitments(),
        api.getSocieties(),
      ]);
      setRecruitments(recs);
      setSocieties(socs);
    } catch (err) {
      console.warn('Error loading recruitment data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = (rec: any) => {
    const soc = societies.find((s) => s.id === rec.societyId) || {
      id: rec.societyId,
      name: rec.societyName || 'Campus Club',
      category: 'Other',
      tagline: 'Official Campus Club',
      about: rec.description || '',
      memberCount: 50,
      logoText: rec.societyLogoText || 'CC',
      logoBg: '#0F172A',
      verified: true,
      foundedYear: 2024,
      websiteUrl: '',
      socialLinks: [],
      recruitment: {
        id: rec.id,
        isOpen: true,
        title: rec.title,
        description: rec.description,
        positions: rec.positions || [],
        lastDate: rec.lastDate,
        mode: rec.mode,
        googleFormUrl: rec.googleFormUrl,
      },
    };
    setSelectedSocietyForApply(soc as SocietyItem);
  };

  return (
    <div className="app-container">
      <Sidebar activeSection="recruitment" />
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      <div className="main-layout">
        <HeaderNav searchQuery="" onSearchChange={() => {}} />
        <MobileTopHeader
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onToggleSearch={() => {}}
          onOpenNotifications={() => {}}
        />

        <main style={{ padding: '28px', maxWidth: '1280px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
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
                {role === 'club' ? 'Club Recruitment Management' : 'Campus Recruitment Season 2026'}
              </h1>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {role === 'club'
                  ? 'Manage your open hiring drives, configure application forms, and add committee positions.'
                  : 'Apply for core committee, design, engineering, and organizing positions across campus clubs.'}
              </p>
            </div>

            {(role === 'club' || role === 'admin') && (
              <button
                className="apply-btn-primary"
                onClick={() => setIsStartHiringOpen(true)}
              >
                + Post New Recruitment Drive
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>Loading active recruitment drives...</div>
            </div>
          ) : recruitments.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)', background: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
              <Briefcase size={40} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {role === 'club' ? 'No active recruitments posted yet.' : 'No active recruitment drives currently open.'}
              </div>
              <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                {role === 'club' ? 'Click "Post New Recruitment Drive" to open positions for students.' : 'Check back soon as societies open recruitments for new batches.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {recruitments.map((rec) => (
                <div
                  key={rec.id || rec._id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid var(--border-light)',
                    padding: '24px',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          background: '#0F172A',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '1rem',
                        }}
                      >
                        {rec.societyLogoText || 'CC'}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{rec.societyName || 'Campus Society'}</span>
                          <CheckCircle2 size={16} fill="#3B82F6" color="#FFFFFF" />
                        </h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          {rec.title}
                        </p>
                      </div>
                    </div>

                    <span
                      style={{
                        padding: '6px 12px',
                        borderRadius: '999px',
                        background: '#ECFDF5',
                        color: '#059669',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                      }}
                    >
                      ● Accepting Applications
                    </span>
                  </div>

                  {rec.description && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {rec.description}
                    </p>
                  )}

                  {rec.positions && rec.positions.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>
                        Open Positions:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {rec.positions.map((pos: any, i: number) => (
                          <span
                            key={i}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '999px',
                              background: '#EEF2FF',
                              color: '#4F46E5',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                            }}
                          >
                            {pos.title} ({pos.seats} Openings)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid #F1F5F9',
                      paddingTop: '16px',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '16px' }}>
                      <span>Deadline: {rec.lastDate || 'Open'}</span>
                      <span>Mode: {rec.mode || 'Internal Portal'}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      {rec.googleFormUrl && (
                        <a
                          href={rec.googleFormUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            borderRadius: '999px',
                            border: '1px solid var(--border-light)',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color: 'var(--text-secondary)',
                          }}
                        >
                          <span>External Form</span>
                          <ExternalLink size={14} />
                        </a>
                      )}
                      {role === 'club' || role === 'admin' ? (
                        <button
                          className="apply-btn-primary"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)',
                          }}
                          onClick={() => {
                            const recId = (rec.id || rec._id)?.toString();
                            setEditingRecruitment({
                              ...rec,
                              id: recId,
                              _id: recId,
                            });
                          }}
                        >
                          <Edit3 size={15} />
                          <span>Edit Hiring Drive</span>
                        </button>
                      ) : (
                        <button
                          className="apply-btn-primary"
                          onClick={() => handleApplyClick(rec)}
                        >
                          Apply Here →
                        </button>
                      )}
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
          onSuccess={() => {
            loadData();
          }}
        />
      )}

      {editingRecruitment && (
        <EditRecruitmentModal
          recruitment={editingRecruitment}
          onClose={() => setEditingRecruitment(null)}
          onSuccess={() => {
            loadData();
          }}
          onDelete={() => {
            loadData();
          }}
        />
      )}

      {isStartHiringOpen && (
        <StartHiringModal
          society={societies[0] || {
            id: 'my-club',
            name: user?.clubName || 'My Club',
            category: 'Other',
            tagline: '',
            about: '',
            memberCount: 0,
            logoText: 'CC',
            logoBg: '#0F172A',
            verified: true,
            foundedYear: 2024,
            websiteUrl: '',
            socialLinks: [],
          }}
          onClose={() => setIsStartHiringOpen(false)}
          onSuccess={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
}
