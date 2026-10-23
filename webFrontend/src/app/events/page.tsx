'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '../../components/Sidebar';
import { HeaderNav } from '../../components/HeaderNav';
import { MobileTopHeader } from '../../components/MobileTopHeader';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import { MobileDrawer } from '../../components/MobileDrawer';
import { EventRegisterModal } from '../../components/EventRegisterModal';
import { CreateEventModal } from '../../components/CreateEventModal';
import { EditEventModal } from '../../components/EditEventModal';
import { EventItem } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Calendar, MapPin, Plus, Radio, Edit3 } from 'lucide-react';

export default function EventsPage() {
  const { role } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<'all' | 'in-person' | 'online' | 'hybrid'>('all');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [registeringEvent, setRegisteringEvent] = useState<EventItem | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await api.getEvents('all');
      setEvents(data);
    } catch (err) {
      console.warn('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((ev) => {
    if (filterMode === 'all') return true;
    return ev.mode === filterMode;
  });

  return (
    <div className="app-container">
      <Sidebar activeSection="events" />
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      <div className="main-layout">
        <HeaderNav searchQuery="" onSearchChange={() => {}} />
        <MobileTopHeader
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onToggleSearch={() => {}}
          onOpenNotifications={() => {}}
        />

        <main style={{ padding: '28px', maxWidth: '1280px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
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
                Campus Events & Workshops
              </h1>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Join hackathons, tech talks, cultural nights, and interactive club workshops.
              </p>
            </div>

            {/* ONLY CLUB LEADS CAN CREATE EVENTS */}
            {role === 'club' && (
              <button
                className="apply-btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus size={16} />
                <span>Create Event</span>
              </button>
            )}
          </div>

          {/* Mode Filter */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {(['all', 'in-person', 'online', 'hybrid'] as const).map((m) => (
              <button
                key={m}
                className={`category-pill ${filterMode === m ? 'active' : ''}`}
                onClick={() => setFilterMode(m)}
              >
                <span style={{ textTransform: 'capitalize' }}>{m}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>Loading campus events...</div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)', background: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
              <Calendar size={40} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>No events scheduled</div>
              <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                {role === 'club' ? 'Click "Create Event" to schedule your club workshop or talk.' : 'Check back later for newly published campus events.'}
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '20px',
              }}
            >
              {filteredEvents.map((ev) => (
                <div
                  key={ev.id}
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
                  <div style={{ height: '140px', background: '#0F172A', position: 'relative' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ev.coverImageUrl || '/images/campus_banner.jpg'}
                      alt={ev.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        padding: '4px 10px',
                        background: ev.mode === 'online' ? '#3B82F6' : '#10B981',
                        color: '#FFFFFF',
                        borderRadius: '999px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      {ev.mode}
                    </span>
                  </div>

                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>
                      {ev.societyName}
                    </div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
                      {ev.title}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1, marginBottom: '14px' }}>
                      {ev.description || ev.summary}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} color="var(--primary)" />
                        <span>{ev.dateTime}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={14} color="var(--primary)" />
                        <span>{ev.location}</span>
                      </div>
                    </div>

                    {role === 'club' ? (
                      <button
                        className="apply-btn-primary"
                        style={{
                          width: '100%',
                          textAlign: 'center',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          background: 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)',
                        }}
                        onClick={() => {
                          const evId = (ev.id || (ev as any)._id)?.toString();
                          setEditingEvent({ ...ev, id: evId, _id: evId });
                        }}
                      >
                        <Edit3 size={15} />
                        <span>Edit Event Details</span>
                      </button>
                    ) : (
                      <button
                        className="apply-btn-primary"
                        style={{ width: '100%', textAlign: 'center' }}
                        onClick={() => setRegisteringEvent(ev)}
                      >
                        Register for Event
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <MobileBottomNav />

      {registeringEvent && (
        <EventRegisterModal
          event={registeringEvent}
          onClose={() => setRegisteringEvent(null)}
          onSuccess={() => {}}
        />
      )}

      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSuccess={() => {
            loadEvents();
          }}
          onDelete={() => {
            loadEvents();
          }}
        />
      )}

      {isCreateOpen && (
        <CreateEventModal
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => {
            loadEvents();
          }}
        />
      )}
    </div>
  );
}
