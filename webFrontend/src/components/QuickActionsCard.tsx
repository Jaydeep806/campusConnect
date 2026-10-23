'use client';

import React from 'react';
import { Briefcase, CalendarPlus, UserPen } from 'lucide-react';

interface QuickActionsCardProps {
  onStartHiring: () => void;
  onCreateEvent: () => void;
  onEditProfile: () => void;
}

export const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  onStartHiring,
  onCreateEvent,
  onEditProfile,
}) => {
  return (
    <div className="widget-card">
      <div className="section-header" style={{ marginBottom: '12px' }}>
        <h3 className="section-title">Quick Actions</h3>
      </div>
      <div className="quick-actions-row">
        <button
          className="quick-action-btn quick-action-green"
          onClick={onStartHiring}
        >
          <Briefcase size={20} />
          <span>Start Hiring</span>
        </button>

        <button
          className="quick-action-btn quick-action-purple"
          onClick={onCreateEvent}
        >
          <CalendarPlus size={20} />
          <span>Create Event</span>
        </button>

        <button
          className="quick-action-btn quick-action-blue"
          onClick={onEditProfile}
        >
          <UserPen size={20} />
          <span>Edit Profile</span>
        </button>
      </div>
    </div>
  );
};
