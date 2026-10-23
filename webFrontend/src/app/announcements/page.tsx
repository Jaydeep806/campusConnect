'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Sidebar } from '../../components/Sidebar';
import { HeaderNav } from '../../components/HeaderNav';
import { MobileTopHeader } from '../../components/MobileTopHeader';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import { MobileDrawer } from '../../components/MobileDrawer';
import { AnnouncementItem } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  Megaphone,
  Bell,
  Calendar,
  Plus,
  CheckCircle2,
  Search,
  Sparkles,
  Building2,
  ShieldCheck,
  Radio,
} from 'lucide-react';

export default function AnnouncementsPage() {
  const { role } = useAuth();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await api.getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.warn('Error loading announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    try {
      await api.createAdminAnnouncement({ title, body });
      setSuccessMsg('Announcement published successfully to campus network!');
      setTitle('');
      setBody('');
      setIsPosting(false);
      loadAnnouncements();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to post announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAnnouncements = useMemo(() => {
    if (!searchQuery.trim()) return announcements;
    const q = searchQuery.toLowerCase();
    return announcements.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.body.toLowerCase().includes(q) ||
        (a.societyName && a.societyName.toLowerCase().includes(q))
    );
  }, [announcements, searchQuery]);

  return (
    <div className="app-container">
      <Sidebar activeSection="announcements" />
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      <div className="main-layout">
        <HeaderNav searchQuery="" onSearchChange={() => {}} />
        <MobileTopHeader
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onToggleSearch={() => {}}
          onOpenNotifications={() => {}}
        />

        <main style={{ padding: '28px', maxWidth: '1280px', width: '100%' }}>
          {/* Back Link */}
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.84rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              marginBottom: '16px',
              transition: 'color var(--transition-fast)',
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>

          {/* STYLISH TEXTURED HERO BANNER WITH THE GENERATED CAMPUS BACKGROUND */}
          <section
            style={{
              position: 'relative',
              borderRadius: '24px',
              overflow: 'hidden',
              marginBottom: '32px',
              minHeight: '260px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '36px 32px',
              backgroundImage: 'url(/images/announcement_bg.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center 42%',
              boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Deep Glassmorphic Texture Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(135deg, rgba(15, 23, 42, 0.88) 0%, rgba(30, 41, 59, 0.72) 50%, rgba(15, 23, 42, 0.94) 100%)',
                backdropFilter: 'blur(2px)',
                zIndex: 1,
              }}
            />

            {/* Glowing Accent Ambient Orb */}
            <div
              style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '280px',
                height: '280px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, rgba(79, 70, 229, 0) 70%)',
                zIndex: 2,
                pointerEvents: 'none',
              }}
            />

            {/* Top Bar inside Hero */}
            <div
              style={{
                position: 'relative',
                zIndex: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#FFFFFF',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                  }}
                >
                  <Radio size={14} color="#34D399" />
                  <span>LIVE CAMPUS NETWORK</span>
                </span>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    background: 'rgba(79, 70, 229, 0.3)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(129, 140, 248, 0.35)',
                    color: '#E0E7FF',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                  }}
                >
                  <ShieldCheck size={14} color="#818CF8" />
                  <span>Verified Advisories</span>
                </span>
              </div>

              {role === 'admin' && (
                <button
                  onClick={() => setIsPosting(!isPosting)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    background: isPosting ? 'rgba(255, 255, 255, 0.15)' : 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px -4px rgba(79, 70, 229, 0.4)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Plus size={16} />
                  <span>{isPosting ? 'Close Form' : 'Broadcast Announcement'}</span>
                </button>
              )}
            </div>

            {/* Hero Main Copy */}
            <div style={{ position: 'relative', zIndex: 3, marginTop: '24px' }}>
              <h1
                style={{
                  fontSize: '2.4rem',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.2,
                  marginBottom: '10px',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.35)',
                }}
              >
                Campus Bulletins & Announcements
              </h1>
              <p
                style={{
                  fontSize: '0.98rem',
                  color: 'rgba(241, 245, 249, 0.9)',
                  maxWidth: '720px',
                  lineHeight: 1.6,
                }}
              >
                Official university schedules, student club recruitment calls, policy updates, and academic notifications curated for the student body.
              </p>
            </div>

            {/* Quick Metrics Bar on Hero Bottom */}
            <div
              style={{
                position: 'relative',
                zIndex: 3,
                marginTop: '28px',
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                flexWrap: 'wrap',
                borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                paddingTop: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#818CF8',
                  }}
                >
                  <Bell size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF' }}>
                    {announcements.length}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(226, 232, 240, 0.8)', fontWeight: 500 }}>
                    Active Notices
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#34D399',
                  }}
                >
                  <Building2 size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF' }}>
                    100%
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(226, 232, 240, 0.8)', fontWeight: 500 }}>
                    Official & Verified
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#F472B6',
                  }}
                >
                  <Sparkles size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF' }}>
                    Realtime
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(226, 232, 240, 0.8)', fontWeight: 500 }}>
                    Push Broadcasts
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Success Banner */}
          {successMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 20px',
                borderRadius: '14px',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#065F46',
                fontSize: '0.88rem',
                fontWeight: 600,
                marginBottom: '24px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.08)',
              }}
            >
              <CheckCircle2 size={20} color="#10B981" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Admin Posting Form */}
          {isPosting && (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                border: '1px solid var(--border-light)',
                padding: '28px',
                marginBottom: '28px',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                  }}
                >
                  <Megaphone size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    Publish Campus Notice
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Broadcast an announcement to all students and societies immediately.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateAnnouncement}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    Notice Title
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Annual Tech Symposium & Club Recruitment Drive 2026"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    Notice Description / Full Content
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="Detailed instructions, dates, requirements, or links for the student body..."
                    required
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={submitting}
                    style={{ minWidth: '180px' }}
                  >
                    {submitting ? 'Broadcasting...' : 'Broadcast Notice Now'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPosting(false)}
                    style={{
                      padding: '12px 20px',
                      borderRadius: '12px',
                      background: 'var(--bg-muted)',
                      border: '1px solid var(--border-light)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Search Filter Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Recent Bulletins
              </h2>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Showing {filteredAnnouncements.length} of {announcements.length} notices
              </span>
            </div>

            {/* Search Input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#FFFFFF',
                border: '1px solid var(--border-light)',
                borderRadius: '12px',
                padding: '8px 14px',
                width: '100%',
                maxWidth: '320px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '0.85rem',
                  color: 'var(--text-main)',
                  width: '100%',
                }}
              />
            </div>
          </div>

          {/* Notices List */}
          {loading ? (
            <div
              style={{
                padding: '80px 0',
                textAlign: 'center',
                background: '#FFFFFF',
                borderRadius: '20px',
                border: '1px solid var(--border-light)',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid var(--border-light)',
                  borderTopColor: 'var(--primary)',
                  borderRadius: '50%',
                  margin: '0 auto 16px auto',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Retrieving Live Announcements...
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Connecting to campus announcement network
              </p>
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div
              style={{
                padding: '60px 24px',
                textAlign: 'center',
                background: '#FFFFFF',
                borderRadius: '20px',
                border: '1px solid var(--border-light)',
              }}
            >
              <Megaphone size={44} style={{ margin: '0 auto 14px auto', opacity: 0.35, color: 'var(--text-muted)' }} />
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {searchQuery ? 'No matching announcements' : 'No announcements posted yet'}
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '6px', maxWidth: '420px', margin: '6px auto 0 auto' }}>
                {searchQuery
                  ? `No notices match "${searchQuery}". Try a different keyword.`
                  : 'Official campus notices, event schedules, and club advisories will be published here.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredAnnouncements.map((ann) => (
                <article
                  key={ann.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '18px',
                    border: '1px solid var(--border-light)',
                    padding: '24px 28px',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    e.currentTarget.style.borderColor = '#C7D2FE';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    e.currentTarget.style.borderColor = 'var(--border-light)';
                  }}
                >
                  {/* Subtle left accent bar */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      bottom: 0,
                      width: '4px',
                      background: 'var(--primary-gradient)',
                    }}
                  />

                  {/* Header Row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: 'var(--primary-light)',
                          color: 'var(--primary)',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                        }}
                      >
                        <Megaphone size={13} />
                        <span>{ann.societyName || 'Campus Administration'}</span>
                      </span>

                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: 'var(--bg-muted)',
                          color: 'var(--text-muted)',
                          fontWeight: 600,
                        }}
                      >
                        Official Notice
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: '0.76rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: 500,
                      }}
                    >
                      <Calendar size={13} />
                      <span>{ann.publishedAt}</span>
                    </div>
                  </div>

                  {/* Notice Title */}
                  <h3
                    style={{
                      fontSize: '1.18rem',
                      fontWeight: 800,
                      color: 'var(--text-main)',
                      marginBottom: '10px',
                      lineHeight: 1.35,
                    }}
                  >
                    {ann.title}
                  </h3>

                  {/* Notice Body */}
                  <p
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.65,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {ann.body}
                  </p>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
