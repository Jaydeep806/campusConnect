'use client';

import React from 'react';
import Link from 'next/link';
import { ApplicationItem } from '../types';
import { ChevronRight } from 'lucide-react';

interface RecentApplicationsCardProps {
  applications: ApplicationItem[];
  onSelectApplication?: (app: ApplicationItem) => void;
}

export const RecentApplicationsCard: React.FC<RecentApplicationsCardProps> = ({
  applications,
  onSelectApplication,
}) => {
  return (
    <div className="widget-card">
      <div className="section-header" style={{ marginBottom: '10px' }}>
        <h3 className="section-title">My Applications</h3>
        <Link href="/applications" className="section-view-all">
          <span>View All</span>
          <ChevronRight size={14} />
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {applications.length === 0 ? (
          <div style={{ padding: '16px 8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No applications submitted yet. Browse open clubs to apply!
          </div>
        ) : (
          applications.slice(0, 3).map((app) => {
            const societyInitials = app.societyName
              .split(' ')
              .slice(0, 2)
              .map((w) => w[0])
              .join('')
              .toUpperCase();

            return (
              <div
                key={app.id}
                className="recent-app-item"
                style={{ cursor: onSelectApplication ? 'pointer' : 'default' }}
                onClick={() => onSelectApplication && onSelectApplication(app)}
              >
                <div className="recent-app-user">
                  <div
                    className="recent-app-avatar"
                    style={{
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                    }}
                  >
                    {societyInitials || 'CC'}
                  </div>
                  <div>
                    <div className="recent-app-name">{app.positionTitle}</div>
                    <div className="recent-app-dept">{app.societyName} • {app.appliedDate}</div>
                  </div>
                </div>

                <span className={`status-pill status-${app.status}`}>
                  {app.status}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

