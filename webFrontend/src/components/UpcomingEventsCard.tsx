'use client';

import React from 'react';
import Link from 'next/link';
import { EventItem } from '../types';
import { ChevronRight } from 'lucide-react';

interface UpcomingEventsCardProps {
  events: EventItem[];
  onRegister: (event: EventItem) => void;
}

export const UpcomingEventsCard: React.FC<UpcomingEventsCardProps> = ({
  events,
  onRegister,
}) => {
  return (
    <div className="widget-card">
      <div className="section-header" style={{ marginBottom: '8px' }}>
        <h3 className="section-title">Upcoming Events</h3>
        <Link href="/events" className="section-view-all">
          <span>View All</span>
          <ChevronRight size={14} />
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {events.slice(0, 3).map((ev) => (
          <div key={ev.id} className="event-widget-item">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ev.coverImageUrl || '/images/campus_banner.jpg'}
              alt={ev.title}
              className="event-thumb-img"
            />
            <div className="event-widget-info">
              <div className="event-widget-title" title={ev.title}>
                {ev.title}
              </div>
              <div className="event-widget-meta">{ev.dateTime}</div>
              <div className="event-widget-meta" style={{ color: 'var(--text-secondary)' }}>
                {ev.location}
              </div>
            </div>
            <button
              className="event-register-btn"
              onClick={() => onRegister(ev)}
            >
              Register
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
