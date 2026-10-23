'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '../../components/Sidebar';
import { HeaderNav } from '../../components/HeaderNav';
import { MobileTopHeader } from '../../components/MobileTopHeader';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import { MobileDrawer } from '../../components/MobileDrawer';
import { ApplicationItem } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Clock, CheckCircle2, XCircle, FileText, Check, X, Inbox } from 'lucide-react';

export default function ApplicationsPage() {
  const { role } = useAuth();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'shortlisted' | 'selected' | 'rejected'>('all');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
  }, [role]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = role === 'club' ? await api.getClubApplications() : await api.getStudentApplications();
      setApplications(data);
    } catch (err) {
      console.warn('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: 'pending' | 'shortlisted' | 'selected' | 'rejected') => {
    setUpdatingId(appId);
    try {
      await api.updateApplicationStatus(appId, newStatus);
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
      setActionMessage(`Applicant status updated to ${newStatus}.`);
      setTimeout(() => setActionMessage(null), 2500);
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to update status');
      setTimeout(() => setActionMessage(null), 3000);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = applications.filter((app) => {
    if (selectedFilter === 'all') return true;
    return app.status === selectedFilter;
  });

  return (
    <div className="app-container">
      <Sidebar activeSection="applications" />
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
              {role === 'club' ? 'Club Candidate Review Portal' : 'My Applications & Status'}
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {role === 'club'
                ? 'Review candidates applying to your society, evaluate responses, and shortlist or select members.'
                : 'Track the real-time progress of your society applications, interview calls, and offers.'}
            </p>
          </div>

          {actionMessage && (
            <div
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#059669',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '16px',
              }}
            >
              {actionMessage}
            </div>
          )}

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {(['all', 'pending', 'shortlisted', 'selected', 'rejected'] as const).map((st) => (
              <button
                key={st}
                className={`category-pill ${selectedFilter === st ? 'active' : ''}`}
                onClick={() => setSelectedFilter(st)}
              >
                <span style={{ textTransform: 'capitalize' }}>{st}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>Loading applications...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)', background: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
              <Inbox size={40} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>No applications found</div>
              <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                {role === 'club' ? 'Applications submitted by candidates will appear here for review.' : 'You have not submitted any applications matching this filter.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filtered.map((app) => (
                <div
                  key={app.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid var(--border-light)',
                    padding: '20px 24px',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FileText size={22} />
                    </div>

                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {role === 'club' ? `${app.studentName} — ${app.positionTitle}` : app.positionTitle}
                      </h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {app.societyName} • Applied on {app.appliedDate}
                      </p>
                      {role === 'club' && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Candidate Dept: {app.departmentAndYear} • Email: {app.email || 'student@college.edu'}
                        </div>
                      )}
                      {app.coverLetter && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px', fontStyle: 'italic' }}>
                          “{app.coverLetter}”
                        </div>
                      )}
                      {app.decisionNote && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '4px', fontWeight: 600 }}>
                          Decision note: {app.decisionNote}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className={`status-pill status-${app.status}`} style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
                      {app.status}
                    </span>

                    {/* ONLY CLUB LEADS CAN SHORTLIST/SELECT/REJECT CANDIDATES */}
                    {role === 'club' && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          disabled={updatingId === app.id || app.status === 'shortlisted'}
                          onClick={() => handleStatusChange(app.id, 'shortlisted')}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: app.status === 'shortlisted' ? '#059669' : '#ECFDF5',
                            color: app.status === 'shortlisted' ? '#FFFFFF' : '#059669',
                            border: '1px solid #A7F3D0',
                          }}
                        >
                          Shortlist
                        </button>
                        <button
                          disabled={updatingId === app.id || app.status === 'selected'}
                          onClick={() => handleStatusChange(app.id, 'selected')}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: app.status === 'selected' ? '#2563EB' : '#EFF6FF',
                            color: app.status === 'selected' ? '#FFFFFF' : '#2563EB',
                            border: '1px solid #BFDBFE',
                          }}
                        >
                          Select
                        </button>
                        <button
                          disabled={updatingId === app.id || app.status === 'rejected'}
                          onClick={() => handleStatusChange(app.id, 'rejected')}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: app.status === 'rejected' ? '#DC2626' : '#FEF2F2',
                            color: app.status === 'rejected' ? '#FFFFFF' : '#DC2626',
                            border: '1px solid #FECACA',
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
