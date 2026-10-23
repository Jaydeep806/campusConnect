'use client';

import React, { useState, useEffect } from 'react';
import { SocietyItem, EventItem } from '../types';
import { api } from '../services/api';
import {
  CheckCircle2,
  Heart,
  Globe,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
  Check,
  Calendar,
  ExternalLink,
} from 'lucide-react';

interface SocietySpotlightProps {
  society: SocietyItem;
  onApplyNow: (society: SocietyItem) => void;
}

const TABS = ['Overview', 'Events', 'Team', 'Recruitment', 'Members', 'FAQ'];

const YEAR_COLORS = ['#60A5FA', '#F472B6', '#34D399', '#FBBF24'];

export const SocietySpotlight: React.FC<SocietySpotlightProps> = ({
  society,
  onApplyNow,
}) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [isLiked, setIsLiked] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    if (activeTab === 'Events') {
      setLoadingEvents(true);
      api.getSocietyEvents(society.id)
        .then((evs) => setEvents(evs))
        .finally(() => setLoadingEvents(false));
    }
  }, [activeTab, society.id]);

  return (
    <div className="spotlight-card">
      {/* Banner Image */}
      <div className="spotlight-banner-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={society.bannerUrl || '/images/society_team_banner.jpg'}
          alt={society.name}
          className="spotlight-banner-img"
        />
      </div>

      {/* Identity & Header Row */}
      <div className="spotlight-header-content">
        <div className="spotlight-identity-row">
          <div className="spotlight-identity-left">
            <div
              className="spotlight-avatar"
              style={{ backgroundColor: society.logoBg || '#0F172A' }}
            >
              {society.logoText || society.name.slice(0, 3).toUpperCase()}
            </div>
            <div className="spotlight-title-box">
              <h3 className="spotlight-title">
                <span>{society.name}</span>
                {society.verified && (
                  <CheckCircle2 size={18} className="verified-badge" fill="#3B82F6" color="#FFFFFF" />
                )}
              </h3>
              <p className="spotlight-subtitle">{society.tagline}</p>
            </div>
          </div>

          <div className="spotlight-actions">
            <button
              className="apply-btn-primary"
              onClick={() => onApplyNow(society)}
            >
              Apply Now
            </button>
            <button
              className="icon-heart-btn"
              onClick={() => setIsLiked(!isLiked)}
              aria-label="Favorite Society"
            >
              <Heart
                size={18}
                fill={isLiked ? '#EF4444' : 'none'}
                color={isLiked ? '#EF4444' : '#64748B'}
              />
            </button>
          </div>
        </div>

        {/* Social Links Row */}
        <div className="spotlight-social-links">
          {society.socialLinks && society.socialLinks.length > 0 ? (
            society.socialLinks.map((sl, idx) => (
              <a
                key={idx}
                href={sl.url}
                target="_blank"
                rel="noreferrer"
                className="social-link-item"
              >
                {sl.platform.toLowerCase().includes('instagram') ? (
                  <Instagram size={14} color="#E1306C" />
                ) : sl.platform.toLowerCase().includes('linkedin') ? (
                  <Linkedin size={14} color="#0A66C2" />
                ) : sl.platform.toLowerCase().includes('youtube') ? (
                  <Youtube size={14} color="#FF0000" />
                ) : (
                  <Globe size={14} color="#2563EB" />
                )}
                <span>{sl.platform}</span>
              </a>
            ))
          ) : (
            <>
              {society.websiteUrl && (
                <a
                  href={society.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="social-link-item"
                >
                  <Globe size={14} color="#2563EB" />
                  <span>Website</span>
                </a>
              )}
            </>
          )}
        </div>

        {/* Spotlight Navigation Tabs */}
        <div className="spotlight-tabs-row">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`spotlight-tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Body Content */}
      {activeTab === 'Overview' && (
        <div className="spotlight-body-grid">
          {/* Left Column: About & What We Do */}
          <div>
            <h4 className="spotlight-section-heading">About Us</h4>
            <p className="spotlight-description">{society.about}</p>

            <h4 className="spotlight-section-heading">What We Do</h4>
            <div className="what-we-do-list">
              {(society.whatWeDo && society.whatWeDo.length > 0
                ? society.whatWeDo
                : [
                    'Conduct technical and creative workshops',
                    'Organize inter-college competitions & hackathons',
                    'Mentorship and skill development sessions',
                    'Industry networking and campus community building',
                  ]
              ).map((item, idx) => (
                <div key={idx} className="what-we-do-item">
                  <Check size={16} className="what-we-do-check" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Head Card & Year Breakdown */}
          <div>
            <div className="head-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  society.currentHead?.avatarUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                }
                alt={society.currentHead?.name || 'Club Lead'}
                className="head-avatar-img"
              />
              <div style={{ flex: 1 }}>
                <div className="head-name">
                  {society.currentHead?.name || `${society.name} Lead`}
                </div>
                <div className="head-role">
                  {society.currentHead?.role || 'President'}
                </div>
                <div className="head-dept">
                  {society.currentHead?.yearAndDept || `Batch of ${society.foundedYear}`}
                </div>
                <div className="head-socials">
                  <Mail size={13} />
                  <Linkedin size={13} />
                  <Instagram size={13} />
                </div>
              </div>
            </div>

            {/* Total Members Breakdown */}
            <div className="member-breakdown-box">
              <div className="member-breakdown-title">
                Total Members: {society.memberCount}
              </div>
              {(society.memberCountsByYear || [
                { batchYear: 2027, label: '1st Year', count: Math.round(society.memberCount * 0.35) },
                { batchYear: 2026, label: '2nd Year', count: Math.round(society.memberCount * 0.25) },
                { batchYear: 2025, label: '3rd Year', count: Math.round(society.memberCount * 0.25) },
                { batchYear: 2024, label: '4th Year', count: Math.round(society.memberCount * 0.15) },
              ]).map((item, idx) => {
                const percentage = society.memberCount > 0 ? Math.round((item.count / society.memberCount) * 100) : 25;
                const color = YEAR_COLORS[idx % YEAR_COLORS.length];
                return (
                  <div key={idx} className="member-bar-row">
                    <span className="member-bar-label">{item.label}</span>
                    <div className="member-bar-track">
                      <div
                        className="member-bar-fill"
                        style={{
                          width: `${Math.min(100, Math.max(5, percentage))}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                    <span className="member-bar-count">{item.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Secondary Tabs Content */}
      {activeTab === 'Events' && (
        <div style={{ padding: '24px' }}>
          <h4 className="spotlight-section-heading">Society Events</h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Workshops, hackathons, and guest seminars hosted by {society.name}.
          </p>
          {loadingEvents ? (
            <div style={{ padding: '20px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Loading society events...
            </div>
          ) : events.length === 0 ? (
            <div style={{ padding: '24px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', marginTop: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No upcoming events currently scheduled for {society.name}. Check back soon!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginTop: '16px' }}>
              {events.map((ev) => (
                <div key={ev.id} style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <h5 style={{ fontSize: '0.92rem', fontWeight: 700 }}>{ev.title}</h5>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {ev.dateTime} • {ev.location}
                  </p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                    {ev.summary}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'Team' && (
        <div style={{ padding: '24px' }}>
          <h4 className="spotlight-section-heading">Executive Team & Leads</h4>
          {(society.team && society.team.length > 0) ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '16px' }}>
              {society.team.map((m, idx) => (
                <div key={idx} style={{ padding: '14px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                    alt={m.name}
                    style={{ width: '50px', height: '50px', borderRadius: '999px', margin: '0 auto 8px auto', objectFit: 'cover' }}
                  />
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{m.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--primary)' }}>{m.role}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {m.department || (m.batchYear ? `Batch ${m.batchYear}` : '')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '24px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', marginTop: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Core team directory is being updated for the current academic session.
            </div>
          )}
        </div>
      )}

      {activeTab === 'Recruitment' && (
        <div style={{ padding: '24px' }}>
          <h4 className="spotlight-section-heading">Open Positions & Deadlines</h4>
          {society.recruitment && society.recruitment.isOpen ? (
            <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', marginTop: '12px' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>
                {society.recruitment.title}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                {society.recruitment.description || 'Join our vibrant core team! Positions open across domains.'}
              </p>
              {society.recruitment.positions && society.recruitment.positions.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                  {society.recruitment.positions.map((p, i) => (
                    <span key={i} style={{ padding: '4px 10px', borderRadius: '999px', background: '#EEF2FF', color: '#4F46E5', fontSize: '0.75rem', fontWeight: 600 }}>
                      {p.title} ({p.seats} Seats)
                    </span>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="apply-btn-primary"
                  onClick={() => onApplyNow(society)}
                >
                  Apply Online Now
                </button>
                {society.recruitment.googleFormUrl && (
                  <a
                    href={society.recruitment.googleFormUrl}
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
                      background: '#FFFFFF',
                    }}
                  >
                    <span>External Form</span>
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div style={{ padding: '24px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', marginTop: '12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Recruitment is currently closed for {society.name}. Follow their social channels to be notified when hiring opens.
            </div>
          )}
        </div>
      )}

      {activeTab === 'Members' && (
        <div style={{ padding: '24px' }}>
          <h4 className="spotlight-section-heading">Member Directory</h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Total registered active members: {society.memberCount} across 1st to 4th year batches.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '16px' }}>
            {(society.memberCountsByYear || []).map((mb, idx) => (
              <div key={idx} style={{ padding: '14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>{mb.label}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>{mb.count} Members</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'FAQ' && (
        <div style={{ padding: '24px' }}>
          <h4 className="spotlight-section-heading">Frequently Asked Questions</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
            <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>How can I become an active member of {society.name}?</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Look for their open recruitment drives on CampusConnect or attend their introductory workshops at the start of each academic semester.
              </div>
            </div>
            <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>Can first-year students join?</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Yes! CampusConnect societies actively recruit students across all batches and academic years.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
