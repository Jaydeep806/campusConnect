'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { GetStartedView } from '../components/GetStartedView';
import { StudentDashboardView } from '../components/StudentDashboardView';
import { ClubDashboardView } from '../components/ClubDashboardView';
import { AdminDashboardView } from '../components/AdminDashboardView';
import { Sidebar } from '../components/Sidebar';
import { HeaderNav } from '../components/HeaderNav';
import { MobileTopHeader } from '../components/MobileTopHeader';
import { MobileBottomNav } from '../../src/components/MobileBottomNav';
import { MobileDrawer } from '../components/MobileDrawer';

// Modals
import { ApplicationModal } from '../components/ApplicationModal';
import { CreateEventModal } from '../components/CreateEventModal';
import { StartHiringModal } from '../components/StartHiringModal';
import { EditProfileModal } from '../components/EditProfileModal';
import { EventRegisterModal } from '../components/EventRegisterModal';

import { SocietyItem, EventItem, ApplicationItem } from '../types';
import { api } from '../services/api';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, role, user, setHasStarted } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [societies, setSocieties] = useState<SocietyItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [selectedSocietyId, setSelectedSocietyId] = useState<string>('');
  const [clubSociety, setClubSociety] = useState<SocietyItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyingSociety, setApplyingSociety] = useState<SocietyItem | null>(null);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isStartHiringOpen, setIsStartHiringOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [registeringEvent, setRegisteringEvent] = useState<EventItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load live data from API
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, selectedCategory, searchQuery, role]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (role === 'club') {
        const clubDash = await api.getClubDashboard();
        if (clubDash.society) {
          setClubSociety(clubDash.society);
          setSelectedSocietyId(clubDash.society.id);
        }
      } else if (role === 'admin') {
        // Admin loads pending clubs within AdminDashboardView
      } else {
        // Student / Discovery view
        const [socs, evs, apps] = await Promise.all([
          api.getSocieties(selectedCategory, searchQuery),
          api.getEvents('all'),
          api.getStudentApplications(),
        ]);
        setSocieties(socs);
        setEvents(evs);
        setApplications(apps);

        if (socs.length > 0 && !selectedSocietyId) {
          setSelectedSocietyId(socs[0].id);
          // fetch full details for first society
          api.getSocietyById(socs[0].id).then((fullSoc) => {
            if (fullSoc) {
              setSocieties((prev) =>
                prev.map((s) => (s.id === fullSoc.id ? fullSoc : s))
              );
            }
          });
        }
      }
    } catch (err) {
      console.warn('API loadData error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSociety = async (id: string) => {
    setSelectedSocietyId(id);
    try {
      const full = await api.getSocietyById(id);
      if (full) {
        setSocieties((prev) =>
          prev.map((s) => (s.id === full.id ? full : s))
        );
      }
    } catch (e) {
      console.warn('Error fetching society details:', e);
    }
  };

  // 1. UNAUTHENTICATED FLOW: START WITH GET STARTED SCREEN
  if (!isAuthenticated || !user) {
    return (
      <GetStartedView
        onGetStarted={() => {
          setHasStarted(true);
          router.push('/login?mode=register');
        }}
        onAlreadyHaveAccount={() => {
          setHasStarted(true);
          router.push('/login?mode=login');
        }}
      />
    );
  }

  const currentClubSociety: SocietyItem = clubSociety || societies[0] || {
    id: 'club',
    name: user.clubName || 'My Campus Club',
    category: 'Other',
    tagline: 'Official Student Organization',
    about: 'Student club management and activities.',
    memberCount: 0,
    logoText: (user.clubName || 'CC').slice(0, 3).toUpperCase(),
    logoBg: '#0F172A',
    verified: true,
    foundedYear: user.foundedYear || 2024,
    websiteUrl: '',
    socialLinks: [],
  };

  return (
    <div className="app-container">
      {/* Desktop Left Sidebar */}
      <Sidebar activeSection="dashboard" />

      {/* Mobile Slide-out Drawer */}
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      {/* Main Layout Area */}
      <div className="main-layout">
        {/* Top Header Bar */}
        <HeaderNav
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Mobile Top Header */}
        <MobileTopHeader
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onToggleSearch={() => {}}
          onOpenNotifications={() => {}}
        />

        {/* 2. ROLE-BASED DASHBOARD VIEWS (Strict Permissions) */}
        {role === 'admin' ? (
          /* ADMIN ONLY VIEW */
          <AdminDashboardView />
        ) : role === 'club' ? (
          /* CLUB LEAD ONLY VIEW: Hiring, Events, Applicant decisions */
          <ClubDashboardView
            society={currentClubSociety}
            onStartHiring={() => setIsStartHiringOpen(true)}
            onCreateEvent={() => setIsCreateEventOpen(true)}
            onEditProfile={() => setIsEditProfileOpen(true)}
          />
        ) : (
          /* STUDENT VIEW: Discovery, Apply, Register, My Applications */
          <StudentDashboardView
            societies={societies}
            events={events}
            applications={applications}
            selectedCategory={selectedCategory}
            selectedSocietyId={selectedSocietyId}
            onSelectCategory={setSelectedCategory}
            onSelectSociety={handleSelectSociety}
            onApplySociety={(soc) => {
              setApplyingSociety(soc);
              setIsApplyModalOpen(true);
            }}
            onRegisterEvent={(ev) => setRegisteringEvent(ev)}
            onEditProfile={() => setIsEditProfileOpen(true)}
          />
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav onOpenProfile={() => setIsEditProfileOpen(true)} />

      {/* Student: Apply to Society Modal */}
      {isApplyModalOpen && applyingSociety && (
        <ApplicationModal
          society={applyingSociety}
          onClose={() => {
            setIsApplyModalOpen(false);
            setApplyingSociety(null);
          }}
          onSuccess={() => {
            loadData();
          }}
        />
      )}

      {/* Club Lead: Create Event Modal */}
      {isCreateEventOpen && (
        <CreateEventModal
          onClose={() => setIsCreateEventOpen(false)}
          onSuccess={() => {
            loadData();
          }}
        />
      )}

      {/* Club Lead: Start Hiring Modal */}
      {isStartHiringOpen && currentClubSociety && (
        <StartHiringModal
          society={currentClubSociety}
          onClose={() => setIsStartHiringOpen(false)}
          onSuccess={() => {
            loadData();
          }}
        />
      )}

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <EditProfileModal
          onClose={() => setIsEditProfileOpen(false)}
          onSuccess={() => {
            loadData();
          }}
        />
      )}

      {/* Student: Event Register Modal */}
      {registeringEvent && (
        <EventRegisterModal
          event={registeringEvent}
          onClose={() => setRegisteringEvent(null)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}
