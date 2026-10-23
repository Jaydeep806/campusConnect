'use client';

import React from 'react';
import { ExternalLink, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { SocietyItem } from '../types';

interface RecruitmentCardProps {
  society: SocietyItem;
  onApply: () => void;
}

export const RecruitmentCard: React.FC<RecruitmentCardProps> = ({
  society,
  onApply,
}) => {
  const rec = society.recruitment;

  if (!rec || !rec.isOpen) {
    return (
      <div className="widget-card">
        <div className="recruitment-badge-row">
          <h3 className="section-title" style={{ margin: 0 }}>
            Recruitment Status
          </h3>
          <span
            style={{
              padding: '3px 8px',
              borderRadius: '999px',
              background: '#F1F5F9',
              color: 'var(--text-muted)',
              fontSize: '0.72rem',
              fontWeight: 700,
            }}
          >
            Closed
          </span>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '12px 0' }}>
          {society.name} is not currently accepting new recruitment applications. Check back during the next semester intake.
        </p>
      </div>
    );
  }

  return (
    <div className="widget-card">
      <div className="recruitment-badge-row">
        <h3 className="section-title" style={{ margin: 0 }}>
          {rec.title}
        </h3>
        <span className="open-badge">
          <CheckCircle2 size={12} />
          <span>Hiring is OPEN</span>
        </span>
      </div>

      {rec.googleFormUrl && (
        <div className="google-form-box">
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Apply via Google Form
          </span>
          <a
            href={rec.googleFormUrl}
            target="_blank"
            rel="noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <span>{rec.googleFormUrl}</span>
            <ExternalLink size={12} />
          </a>
        </div>
      )}

      {rec.positions && rec.positions.length > 0 && (
        <>
          <div style={{ marginBottom: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Open Positions
          </div>
          <div className="open-positions-tags">
            {rec.positions.map((pos, idx) => (
              <span key={idx} className="position-tag">
                {pos.title} ({pos.seats})
              </span>
            ))}
          </div>
        </>
      )}

      <button className="apply-here-btn" onClick={onApply}>
        <span>Apply Here</span>
        <ArrowRight size={16} />
      </button>

      <div className="recruitment-footer-meta">
        <span>Last Date: {rec.lastDate || 'Open'}</span>
        <span>Mode: {rec.mode || 'Internal Portal'}</span>
      </div>
    </div>
  );
};
