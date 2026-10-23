'use client';

import React from 'react';
import Link from 'next/link';
import { HeroBanner } from './HeroBanner';
import { CategoryFilters } from './CategoryFilters';
import { FeaturedSocieties } from './FeaturedSocieties';
import { SocietySpotlight } from './SocietySpotlight';
import { OtherPagesGrid } from './OtherPagesGrid';
import { UpcomingEventsCard } from './UpcomingEventsCard';
import { RecruitmentCard } from './RecruitmentCard';
import { RecentApplicationsCard } from './RecentApplicationsCard';
import { SocietyItem, EventItem, ApplicationItem } from '../types';
import { FileText, Compass, Calendar, UserPen, Briefcase } from 'lucide-react';

interface StudentDashboardViewProps {
  societies: SocietyItem[];
  events: EventItem[];
  applications: ApplicationItem[];
  selectedCategory: string;
  selectedSocietyId: string;
  onSelectCategory: (cat: string) => void;
  onSelectSociety: (id: string) => void;
  onApplySociety: (society: SocietyItem) => void;
  onRegisterEvent: (event: EventItem) => void;
  onEditProfile: () => void;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
  societies,
  events,
  applications,
  selectedCategory,
  selectedSocietyId,
  onSelectCategory,
  onSelectSociety,
  onApplySociety,
  onRegisterEvent,
  onEditProfile,
}) => {
  const currentSpotlightSociety =
    societies.find((s) => s.id === selectedSocietyId) || societies[0];

  return (
    <main className="content-grid">
      {/* Center Main Column */}
      <section className="center-column">
        {/* Hero Welcome Banner */}
        <HeroBanner />

        {/* Category Filter Pills */}
        <CategoryFilters
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
        />

        {/* Featured Societies Row */}
        <FeaturedSocieties
          societies={societies}
          selectedSocietyId={selectedSocietyId}
          onSelectSociety={onSelectSociety}
        />

        {/* Interactive Spotlight Card */}
        {currentSpotlightSociety && (
          <SocietySpotlight
            society={currentSpotlightSociety}
            onApplyNow={onApplySociety}
          />
        )}

        {/* Other Important Pages 4-Card Grid */}
        <OtherPagesGrid />
      </section>

      {/* Right Column (Student Specific Widgets) */}
      <aside className="right-column">
        {/* Upcoming Events Card (Students register for events) */}
        <UpcomingEventsCard
          events={events}
          onRegister={onRegisterEvent}
        />

        {/* Student Quick Actions (NO Start Hiring, NO Create Event!) */}
        <div className="widget-card">
          <div className="section-header" style={{ marginBottom: '12px' }}>
            <h3 className="section-title">Student Shortcuts</h3>
          </div>
          <div className="quick-actions-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <Link
              href="/recruitment"
              className="quick-action-btn quick-action-blue"
              style={{ textDecoration: 'none' }}
            >
              <Briefcase size={18} />
              <span>Hiring Drives</span>
            </Link>

            <Link
              href="/applications"
              className="quick-action-btn quick-action-green"
              style={{ textDecoration: 'none' }}
            >
              <FileText size={18} />
              <span>Applications</span>
            </Link>

            <Link
              href="/societies"
              className="quick-action-btn quick-action-purple"
              style={{ textDecoration: 'none' }}
            >
              <Compass size={18} />
              <span>Clubs</span>
            </Link>

            <button
              className="quick-action-btn quick-action-amber"
              onClick={onEditProfile}
            >
              <UserPen size={18} />
              <span>Profile</span>
            </button>
          </div>
        </div>

        {/* Recruitment 2026 Card */}
        {currentSpotlightSociety && (
          <RecruitmentCard
            society={currentSpotlightSociety}
            onApply={() => onApplySociety(currentSpotlightSociety)}
          />
        )}

        {/* My Applications Card */}
        <RecentApplicationsCard applications={applications} />
      </aside>
    </main>
  );
};
