'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Building2,
  Users,
  Calendar,
  Briefcase,
  Megaphone,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Search,
  Clock,
  FileText,
  MapPin,
  X,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { EditEventModal } from './EditEventModal';
import { EditRecruitmentModal } from './EditRecruitmentModal';
import { CreateEventModal } from './CreateEventModal';

export const AdminDashboardView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'clubs' | 'events' | 'announcements' | 'recruitments'>('clubs');
  const [stats, setStats] = useState<any>(null);
  const [clubs, setClubs] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [recruitments, setRecruitments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  // Modals state
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [editingRecruitment, setEditingRecruitment] = useState<any | null>(null);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<any | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any | null>(null);
  const [isCreateAnnouncementOpen, setIsCreateAnnouncementOpen] = useState(false);

  // Announcement form state
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeBody, setNewNoticeBody] = useState('');
  const [submittingNotice, setSubmittingNotice] = useState(false);

  // Edit Club form state
  const [clubName, setClubName] = useState('');
  const [foundedYear, setFoundedYear] = useState('');
  const [category, setCategory] = useState('Technical');
  const [tagline, setTagline] = useState('');
  const [about, setAbout] = useState('');
  const [submittingClub, setSubmittingClub] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [s, c, ev, a, r] = await Promise.all([
        api.adminGetStats(),
        api.adminGetClubs(),
        api.adminGetEvents(),
        api.adminGetAnnouncements(),
        api.adminGetRecruitments(),
      ]);
      setStats(s);
      setClubs(c);
      setEvents(ev);
      setAnnouncements(a);
      setRecruitments(r);
    } catch (err) {
      console.warn('Error loading admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 4000);
  };

  // Club Handlers
  const handleApproveClub = async (id: string, name: string) => {
    try {
      await api.approveClub(id);
      showToast(`"${name}" has been approved! Club lead credentials are now active.`);
      loadAllData();
    } catch (e: any) {
      alert(e.message || 'Failed to approve club');
    }
  };

  const handleSetClubStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.adminSetClubStatus(id, status);
      showToast(`Club status updated to ${status}.`);
      loadAllData();
    } catch (e: any) {
      alert(e.message || 'Failed to change club status');
    }
  };

  const handleDeleteClub = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}" and all its data?`)) return;
    try {
      await api.adminDeleteClub(id);
      showToast(`Club "${name}" and all associated data deleted.`);
      loadAllData();
    } catch (e: any) {
      alert(e.message || 'Failed to delete club');
    }
  };

  const openEditClubModal = (club: any) => {
    setEditingClub(club);
    setClubName(club.clubName || club.society?.name || '');
    setFoundedYear(String(club.foundedYear || club.society?.foundedYear || 2024));
    setCategory(club.society?.category || 'Technical');
    setTagline(club.society?.tagline || '');
    setAbout(club.society?.about || '');
  };

  const handleSaveClubProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClub) return;
    setSubmittingClub(true);
    try {
      await api.adminUpdateClubProfile(editingClub.id, {
        clubName,
        foundedYear: Number(foundedYear) || 2024,
        category,
        tagline,
        about,
      });
      showToast('Club details updated successfully.');
      setEditingClub(null);
      loadAllData();
    } catch (e: any) {
      alert(e.message || 'Failed to update club profile');
    } finally {
      setSubmittingClub(false);
    }
  };

  // Event Handlers
  const handleDeleteEvent = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete event "${title}"?`)) return;
    try {
      await api.adminDeleteEvent(id);
      showToast(`Event "${title}" has been deleted.`);
      loadAllData();
    } catch (e: any) {
      alert(e.message || 'Failed to delete event');
    }
  };

  // Announcement Handlers
  const handleSaveNewAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle.trim() || !newNoticeBody.trim()) return;
    setSubmittingNotice(true);
    try {
      await api.adminCreateAnnouncement({ title: newNoticeTitle.trim(), body: newNoticeBody.trim() });
      showToast('Campus notice broadcasted successfully!');
      setNewNoticeTitle('');
      setNewNoticeBody('');
      setIsCreateAnnouncementOpen(false);
      loadAllData();
    } catch (e: any) {
      alert(e.message || 'Failed to broadcast announcement');
    } finally {
      setSubmittingNotice(false);
    }
  };

  const handleSaveEditAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement) return;
    try {
      await api.adminUpdateAnnouncement(editingAnnouncement.id, {
        title: editingAnnouncement.title,
        body: editingAnnouncement.body,
        status: editingAnnouncement.status,
      });
      showToast('Announcement updated successfully.');
      setEditingAnnouncement(null);
      loadAllData();
    } catch (e: any) {
      alert(e.message || 'Failed to update announcement');
    }
  };

  const handleDeleteAnnouncement = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete announcement "${title}"?`)) return;
    try {
      await api.adminDeleteAnnouncement(id);
      showToast(`Announcement deleted.`);
      loadAllData();
    } catch (e: any) {
      alert(e.message || 'Failed to delete announcement');
    }
  };

  // Recruitment Handlers
  const handleDeleteRecruitment = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete recruitment drive "${title}"?`)) return;
    try {
      await api.adminDeleteRecruitment(id);
      showToast(`Recruitment drive "${title}" deleted.`);
      loadAllData();
    } catch (e: any) {
      alert(e.message || 'Failed to delete recruitment drive');
    }
  };

  const pendingClubs = clubs.filter((c) => c.approvalStatus === 'pending');
  const approvedClubs = clubs.filter((c) => c.approvalStatus === 'approved');

  return (
    <main style={{ padding: '28px', maxWidth: '1360px', width: '100%', margin: '0 auto' }}>
      {/* Admin Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
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
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 8px 20px rgba(220, 38, 38, 0.35)',
            }}
          >
            <ShieldCheck size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Campus Administration Control Center</h1>
              <span
                style={{
                  background: 'rgba(239, 68, 68, 0.25)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#FCA5A5',
                }}
              >
                SUPERADMIN ACCESS
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#94A3B8', marginTop: '4px' }}>
              Full administrative privileges to manage all campus clubs, edit events, broadcast notices, and oversee recruitment drives.
            </p>
          </div>
        </div>

        {/* Quick metric stats */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ padding: '10px 16px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>{clubs.length}</div>
            <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>TOTAL CLUBS</div>
          </div>
          <div style={{ padding: '10px 16px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F87171' }}>{pendingClubs.length}</div>
            <div style={{ fontSize: '0.7rem', color: '#FCA5A5', fontWeight: 600 }}>PENDING</div>
          </div>
          <div style={{ padding: '10px 16px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>{events.length}</div>
            <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>EVENTS</div>
          </div>
          <div style={{ padding: '10px 16px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>{recruitments.length}</div>
            <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>DRIVES</div>
          </div>
        </div>
      </div>

      {message && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '12px',
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#059669',
            fontSize: '0.88rem',
            fontWeight: 600,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-light)', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { id: 'clubs', label: `Clubs & Societies (${clubs.length})`, icon: Building2 },
          { id: 'events', label: `Events Management (${events.length})`, icon: Calendar },
          { id: 'announcements', label: `Announcements & Bulletins (${announcements.length})`, icon: Megaphone },
          { id: 'recruitments', label: `Hiring Drives (${recruitments.length})`, icon: Briefcase },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                borderRadius: '12px 12px 0 0',
                fontSize: '0.88rem',
                fontWeight: 700,
                borderBottom: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                background: isActive ? '#FFFFFF' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: CLUBS MANAGEMENT */}
      {activeTab === 'clubs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Pending Clubs Section */}
          <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid var(--border-light)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Pending Club Registrations ({pendingClubs.length})
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Clubs waiting for administrative review before their public profiles go live.
                </p>
              </div>
            </div>

            {pendingClubs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 10px', color: 'var(--text-muted)', background: '#F8FAFC', borderRadius: '12px' }}>
                <CheckCircle2 size={36} color="#10B981" style={{ margin: '0 auto 8px auto' }} />
                <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>No Pending Registrations</div>
                <p style={{ fontSize: '0.8rem', marginTop: '2px' }}>All club account requests have been reviewed.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {pendingClubs.map((club) => (
                  <div
                    key={club.id}
                    style={{
                      background: '#FFFBEB',
                      borderRadius: '14px',
                      border: '1px solid #FDE68A',
                      padding: '18px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '16px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>{club.clubName}</h3>
                        <span style={{ padding: '2px 8px', borderRadius: '999px', background: '#FEF3C7', color: '#D97706', fontSize: '0.72rem', fontWeight: 800 }}>
                          PENDING APPROVAL
                        </span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Login Email: <strong>{club.email}</strong> • Founded: {club.foundedYear || 2024}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleSetClubStatus(club.id, 'rejected')}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: '1px solid #FECACA',
                          background: '#FEF2F2',
                          color: '#DC2626',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleApproveClub(club.id, club.clubName)}
                        style={{
                          padding: '8px 18px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                          color: '#FFFFFF',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                        }}
                      >
                        Approve & Activate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Approved Clubs Directory */}
          <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid var(--border-light)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  All Campus Clubs & Societies ({clubs.length})
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Direct administrative edit control over profiles, categories, descriptions, and account states.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {clubs.map((c) => (
                <div
                  key={c.id}
                  style={{
                    background: '#F8FAFC',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {c.clubName || c.society?.name || 'Club'}
                      </h3>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '999px',
                          background: c.approvalStatus === 'approved' ? '#ECFDF5' : '#FEF2F2',
                          color: c.approvalStatus === 'approved' ? '#059669' : '#DC2626',
                        }}
                      >
                        {c.approvalStatus.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, marginTop: '2px' }}>
                      {c.society?.category || 'Technical'} • Founded {c.foundedYear || 2024}
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {c.email}
                    </div>

                    {c.society?.tagline && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px', fontStyle: 'italic' }}>
                        &ldquo;{c.society.tagline}&rdquo;
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      <span>Events: <strong>{c.stats?.eventsCount || 0}</strong></span>
                      <span>Drives: <strong>{c.stats?.recruitmentsCount || 0}</strong></span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
                    <button
                      onClick={() => openEditClubModal(c)}
                      style={{
                        flex: 1,
                        padding: '8px',
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
                      }}
                    >
                      <Edit3 size={14} />
                      <span>Edit Profile</span>
                    </button>

                    <button
                      onClick={() => handleDeleteClub(c.id, c.clubName || c.society?.name)}
                      title="Delete Club"
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: '#FEF2F2',
                        border: '1px solid #FECACA',
                        color: '#DC2626',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EVENTS MANAGEMENT */}
      {activeTab === 'events' && (
        <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid var(--border-light)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Campus Events Directory ({events.length})
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Administer, edit, reschedule, or cancel events across all societies.
              </p>
            </div>
            <button
              onClick={() => setIsCreateEventOpen(true)}
              className="apply-btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} />
              <span>Create Official Event</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {events.map((ev) => (
              <div
                key={ev.id}
                style={{
                  background: '#F8FAFC',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--primary)', fontWeight: 800 }}>
                    {ev.societyName}
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                    {ev.title}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
                    {ev.summary}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={13} />
                      <span>{ev.dateTime}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={13} />
                      <span>{ev.location} ({ev.mode})</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
                  <button
                    onClick={() => setEditingEvent(ev)}
                    style={{
                      flex: 1,
                      padding: '8px',
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
                    }}
                  >
                    <Edit3 size={14} />
                    <span>Edit Event</span>
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(ev.id, ev.title)}
                    title="Delete Event"
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      color: '#DC2626',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ANNOUNCEMENTS MANAGEMENT */}
      {activeTab === 'announcements' && (
        <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid var(--border-light)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Official Campus Notices & Bulletins ({announcements.length})
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Publish verified advisories, edit announcements, or remove outdated notices.
              </p>
            </div>
            <button
              onClick={() => setIsCreateAnnouncementOpen(true)}
              className="apply-btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} />
              <span>Broadcast Notice</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {announcements.map((ann) => (
              <div
                key={ann.id}
                style={{
                  background: '#F8FAFC',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.74rem', padding: '3px 8px', borderRadius: '6px', background: '#EEF2FF', color: 'var(--primary)', fontWeight: 700 }}>
                      {ann.societyName || 'Campus Administration'}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {ann.publishedAt ? new Date(ann.publishedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Notice'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
                    {ann.title}
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {ann.body}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setEditingAnnouncement(ann)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      background: '#FFFFFF',
                      border: '1px solid #C7D2FE',
                      color: 'var(--primary)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    <Edit3 size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteAnnouncement(ann.id, ann.title)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      color: '#DC2626',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: RECRUITMENTS MANAGEMENT */}
      {activeTab === 'recruitments' && (
        <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid var(--border-light)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Campus Hiring Drives ({recruitments.length})
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Oversee club hiring drives, configure open positions, deadlines, and application links.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {recruitments.map((rec) => (
              <div
                key={rec.id}
                style={{
                  background: '#F8FAFC',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--primary)', fontWeight: 800 }}>
                      {rec.societyName}
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '999px',
                        background: rec.status === 'open' ? '#ECFDF5' : '#FEF2F2',
                        color: rec.status === 'open' ? '#059669' : '#DC2626',
                      }}
                    >
                      {rec.status === 'open' ? 'OPEN' : 'CLOSED'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '6px' }}>
                    {rec.title}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
                    {rec.description}
                  </p>

                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>OPEN POSITIONS</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                      {(rec.positions || []).map((p: any, i: number) => (
                        <span key={i} style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', background: '#FFFFFF', border: '1px solid #E2E8F0', fontWeight: 600 }}>
                          {p.title} ({p.seats} seats)
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
                  <button
                    onClick={() => setEditingRecruitment(rec)}
                    style={{
                      flex: 1,
                      padding: '8px',
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
                    }}
                  >
                    <Edit3 size={14} />
                    <span>Edit Drive</span>
                  </button>
                  <button
                    onClick={() => handleDeleteRecruitment(rec.id, rec.title)}
                    title="Delete Drive"
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      color: '#DC2626',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: Edit Club Profile */}
      {editingClub && (
        <div className="modal-backdrop" onClick={() => setEditingClub(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Edit Club Details (Admin)</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Update official club records and profile information.</p>
              </div>
              <button className="modal-close-btn" onClick={() => setEditingClub(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveClubProfile}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>Club Name</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>Category</label>
                  <select
                    className="form-input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Technical">Technical</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Social">Social</option>
                    <option value="Creative">Creative</option>
                    <option value="Startup">Startup</option>
                    <option value="Academic">Academic</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>Founded Year</label>
                  <input
                    type="number"
                    className="form-input"
                    value={foundedYear}
                    onChange={(e) => setFoundedYear(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>Tagline</label>
                <input
                  type="text"
                  className="form-input"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Short one-line club motto"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>About & Description</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="Club history, achievements, and focus areas"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="apply-btn-secondary"
                  onClick={() => setEditingClub(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="apply-btn-primary"
                  disabled={submittingClub}
                >
                  {submittingClub ? 'Saving Changes...' : 'Save Club Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Broadcast Announcement */}
      {isCreateAnnouncementOpen && (
        <div className="modal-backdrop" onClick={() => setIsCreateAnnouncementOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Broadcast Campus Notice</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Publish official administrative advisory to all students and clubs.</p>
              </div>
              <button className="modal-close-btn" onClick={() => setIsCreateAnnouncementOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveNewAnnouncement}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>Notice Title</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Campus Recruitment Season 2026 Advisory"
                  value={newNoticeTitle}
                  onChange={(e) => setNewNoticeTitle(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>Notice Content / Body</label>
                <textarea
                  className="form-input"
                  rows={5}
                  required
                  placeholder="Provide detailed instructions, deadlines, guidelines..."
                  value={newNoticeBody}
                  onChange={(e) => setNewNoticeBody(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="apply-btn-secondary"
                  onClick={() => setIsCreateAnnouncementOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="apply-btn-primary"
                  disabled={submittingNotice}
                >
                  {submittingNotice ? 'Broadcasting...' : 'Broadcast Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Announcement */}
      {editingAnnouncement && (
        <div className="modal-backdrop" onClick={() => setEditingAnnouncement(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Edit Announcement Notice</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Update notice headline or bulletin copy.</p>
              </div>
              <button className="modal-close-btn" onClick={() => setEditingAnnouncement(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEditAnnouncement}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>Notice Title</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={editingAnnouncement.title}
                  onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>Status</label>
                <select
                  className="form-input"
                  value={editingAnnouncement.status}
                  onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, status: e.target.value })}
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>Notice Content</label>
                <textarea
                  className="form-input"
                  rows={5}
                  required
                  value={editingAnnouncement.body}
                  onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, body: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="apply-btn-secondary"
                  onClick={() => setEditingAnnouncement(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="apply-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Edit Event */}
      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSuccess={() => {
            showToast('Event updated successfully.');
            loadAllData();
          }}
          onDelete={() => {
            showToast('Event deleted.');
            loadAllData();
          }}
        />
      )}

      {/* MODAL 5: Create Event */}
      {isCreateEventOpen && (
        <CreateEventModal
          onClose={() => setIsCreateEventOpen(false)}
          onSuccess={() => {
            showToast('Event created successfully.');
            loadAllData();
          }}
        />
      )}

      {/* MODAL 6: Edit Recruitment */}
      {editingRecruitment && (
        <EditRecruitmentModal
          recruitment={editingRecruitment}
          onClose={() => setEditingRecruitment(null)}
          onSuccess={() => {
            showToast('Recruitment drive updated successfully.');
            loadAllData();
          }}
          onDelete={() => {
            showToast('Recruitment drive deleted.');
            loadAllData();
          }}
        />
      )}
    </main>
  );
};
