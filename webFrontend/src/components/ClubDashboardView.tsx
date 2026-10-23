'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Briefcase,
  Calendar,
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Edit3,
} from 'lucide-react';
import { SocietyItem, EventItem, ApplicationItem } from '../types';
import { api } from '../services/api';
import { EditEventModal } from './EditEventModal';
import { EditRecruitmentModal } from './EditRecruitmentModal';

interface ClubDashboardViewProps {
  society: SocietyItem;
  onStartHiring: () => void;
  onCreateEvent: () => void;
  onEditProfile: () => void;
}

export const ClubDashboardView: React.FC<ClubDashboardViewProps> = ({
  society,
  onStartHiring,
  onCreateEvent,
  onEditProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'applications' | 'recruitment' | 'events' | 'members'>('applications');
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [clubRecruitments, setClubRecruitments] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'shortlisted' | 'selected' | 'rejected'>('all');
  const [updatingAppId, setUpdatingAppId] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [editingRecruitment, setEditingRecruitment] = useState<any | null>(null);

  useEffect(() => {
    loadClubData();
  }, [society.id]);

  const loadClubData = async () => {
    try {
      const [apps, evs, mems, recs] = await Promise.all([
        api.getClubApplications(),
        api.getClubEvents(),
        api.getClubMembers(),
        api.getClubRecruitments(),
      ]);
      setApplications(apps);
      setEvents(evs);
      setMembers(mems);
      setClubRecruitments(recs);
    } catch (err) {
      console.warn('Failed loading club data:', err);
    }
  };

  const handleUpdateStatus = async (appId: string, newStatus: 'pending' | 'shortlisted' | 'selected' | 'rejected') => {
    setUpdatingAppId(appId);
    try {
      await api.updateApplicationStatus(appId, newStatus);
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
    } finally {
      setUpdatingAppId(null);
    }
  };

  const filteredApps = applications.filter((a) => {
    if (statusFilter === 'all') return true;
    return a.status === statusFilter;
  });

  return (
    <main style={{ padding: '28px', maxWidth: '1280px', width: '100%', margin: '0 auto' }}>
      {/* Club Identity Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
          borderRadius: '24px',
          padding: '28px 32px',
          color: '#FFFFFF',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '16px',
              background: '#FFFFFF',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.4rem',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
            }}
          >
            {society.logoText || society.name.slice(0, 3).toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{society.name}</h1>
              <span
                style={{
                  background: 'rgba(59, 130, 246, 0.3)',
                  border: '1px solid rgba(59, 130, 246, 0.5)',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                }}
              >
                CLUB LEAD PORTAL
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.8)', marginTop: '4px' }}>
              {society.tagline} • Est. {society.foundedYear} • Category: {society.category}
            </p>
          </div>
        </div>

        {/* Club Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onStartHiring}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#FFFFFF',
              padding: '10px 18px',
              borderRadius: '999px',
              fontSize: '0.85rem',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            }}
          >
            <Briefcase size={16} />
            <span>Start Hiring</span>
          </button>

          <button
            onClick={onCreateEvent}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
              color: '#FFFFFF',
              padding: '10px 18px',
              borderRadius: '999px',
              fontSize: '0.85rem',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
            }}
          >
            <Calendar size={16} />
            <span>Create Event</span>
          </button>

          <button
            onClick={onEditProfile}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#FFFFFF',
              padding: '10px 18px',
              borderRadius: '999px',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <Edit3 size={16} />
            <span>Edit Club</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Active Members</span>
            <Users size={18} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px' }}>{society.memberCount}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--primary)', marginTop: '4px' }}>Across 4 academic years</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Recruitment Status</span>
            <Briefcase size={18} color="#10B981" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10B981', marginTop: '10px' }}>
            {society.hasOpenRecruitment ? 'HIRING OPEN' : 'CLOSED'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {society.recruitment?.positions.length || 0} Open Positions
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Upcoming Events</span>
            <Calendar size={18} color="#8B5CF6" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px' }}>{events.length}</div>
          <div style={{ fontSize: '0.72rem', color: '#8B5CF6', marginTop: '4px' }}>Published sessions</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Candidate Applications</span>
            <FileText size={18} color="#3B82F6" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px' }}>{applications.length}</div>
          <div style={{ fontSize: '0.72rem', color: '#3B82F6', marginTop: '4px' }}>Awaiting lead decision</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', marginBottom: '20px', gap: '10px' }}>
        {[
          { id: 'applications', label: `Candidate Review (${applications.length})` },
          { id: 'recruitment', label: 'Recruitment Settings' },
          { id: 'events', label: `Hosted Events (${events.length})` },
          { id: 'members', label: 'Member Roster' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '10px 18px',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab.id ? '3px solid var(--primary)' : '3px solid transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Applications Candidate Review */}
      {activeTab === 'applications' && (
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Applicant Management</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Review candidate resumes and update their hiring status.
              </p>
            </div>

            {/* Status Filter Pills */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['all', 'pending', 'shortlisted', 'selected', 'rejected'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`category-pill ${statusFilter === s ? 'active' : ''}`}
                  style={{ textTransform: 'capitalize', fontSize: '0.75rem', padding: '5px 12px' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredApps.map((app) => (
              <div
                key={app.id}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>{app.studentName}</h4>
                    <span className={`status-pill status-${app.status}`}>
                      {app.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {app.departmentAndYear} • Applied for: <strong>{app.positionTitle}</strong>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Email: {app.email || 'student@college.edu'} • Applied: {app.appliedDate}
                  </div>
                  {app.coverLetter && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-main)', marginTop: '6px', fontStyle: 'italic', background: '#FFFFFF', padding: '6px 10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                      “{app.coverLetter}”
                    </div>
                  )}
                </div>

                {/* Status Decision Buttons */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => handleUpdateStatus(app.id, 'shortlisted')}
                    disabled={updatingAppId === app.id || app.status === 'shortlisted'}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: app.status === 'shortlisted' ? '#059669' : '#ECFDF5',
                      color: app.status === 'shortlisted' ? '#FFFFFF' : '#059669',
                      border: '1px solid #A7F3D0',
                    }}
                  >
                    Shortlist
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(app.id, 'selected')}
                    disabled={updatingAppId === app.id || app.status === 'selected'}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: app.status === 'selected' ? '#2563EB' : '#EFF6FF',
                      color: app.status === 'selected' ? '#FFFFFF' : '#2563EB',
                      border: '1px solid #BFDBFE',
                    }}
                  >
                    Select
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(app.id, 'rejected')}
                    disabled={updatingAppId === app.id || app.status === 'rejected'}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: app.status === 'rejected' ? '#DC2626' : '#FEF2F2',
                      color: app.status === 'rejected' ? '#FFFFFF' : '#DC2626',
                      border: '1px solid #FECACA',
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Recruitment Settings */}
      {activeTab === 'recruitment' && (
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Recruitment Drive Configuration</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Set open positions, Google Form application URL, and deadlines.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                className="apply-btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)',
                }}
                onClick={() => {
                  const drive = clubRecruitments[0] || (society.recruitment ? {
                    id: society.recruitment.id,
                    _id: (society.recruitment as any)._id || society.recruitment.id,
                    title: society.recruitment.title || 'Recruitment Drive',
                    description: society.recruitment.description || '',
                    positions: society.recruitment.positions || [],
                    lastDate: society.recruitment.lastDate,
                    googleFormUrl: society.recruitment.googleFormUrl,
                    status: 'open',
                  } : null);

                  if (!drive || (!drive.id && !drive._id)) {
                    onStartHiring();
                    return;
                  }

                  const validId = (drive.id || drive._id)?.toString();
                  setEditingRecruitment({
                    ...drive,
                    id: validId,
                    _id: validId,
                  });
                }}
              >
                <Edit3 size={15} />
                <span>Edit Drive & Positions</span>
              </button>

              <button className="apply-btn-primary" onClick={onStartHiring}>
                <Plus size={16} /> New Drive
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>DRIVE TITLE</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, marginTop: '4px' }}>
                {society.recruitment?.title || 'Recruitment 2026-2027'}
              </div>
            </div>

            <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>APPLICATION MODE</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, marginTop: '4px' }}>
                {society.recruitment?.mode || 'Google Form'}
              </div>
            </div>

            <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>DEADLINE</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, marginTop: '4px' }}>
                {society.recruitment?.lastDate || '30 Oct 2026'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Club Events */}
      {activeTab === 'events' && (
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Club Events & Sessions</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Host technical bootcamps, hackathons, and guest seminars.
              </p>
            </div>
            <button className="apply-btn-primary" onClick={onCreateEvent}>
              <Plus size={16} /> Publish New Event
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {events.map((e) => (
              <div key={e.id} style={{ padding: '16px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column' }}>
                <span style={{ alignSelf: 'flex-start', fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: '999px', background: '#EEF2FF', color: 'var(--primary)' }}>
                  {e.mode}
                </span>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, marginTop: '8px' }}>{e.title}</h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{e.dateTime} • {e.location}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px', flex: 1 }}>{e.summary}</div>
                <button
                  type="button"
                  onClick={() => {
                    const evId = (e.id || (e as any)._id)?.toString();
                    setEditingEvent({ ...e, id: evId, _id: evId });
                  }}
                  style={{
                    marginTop: '12px',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    border: '1px solid #C7D2FE',
                    color: 'var(--primary)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(el) => {
                    el.currentTarget.style.background = '#EEF2FF';
                  }}
                  onMouseLeave={(el) => {
                    el.currentTarget.style.background = '#FFFFFF';
                  }}
                >
                  <Edit3 size={14} />
                  <span>Edit Event Details</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Members */}
      {activeTab === 'members' && (
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '4px' }}>Club Executive Committee</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Active society team leads and coordinators for 2026-2027.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
            {(members.length > 0 ? members : society.team || []).map((m, idx) => (
              <div key={idx} style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                  alt={m.name}
                  style={{ width: '56px', height: '56px', borderRadius: '999px', margin: '0 auto 8px auto', objectFit: 'cover' }}
                />
                <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{m.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>{m.role}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {m.department || (m.batchYear ? `Batch of ${m.batchYear}` : '')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSuccess={() => {
            loadClubData();
          }}
          onDelete={() => {
            loadClubData();
          }}
        />
      )}

      {editingRecruitment && (
        <EditRecruitmentModal
          recruitment={editingRecruitment}
          onClose={() => setEditingRecruitment(null)}
          onSuccess={() => {
            loadClubData();
          }}
          onDelete={() => {
            loadClubData();
          }}
        />
      )}
    </main>
  );
};
