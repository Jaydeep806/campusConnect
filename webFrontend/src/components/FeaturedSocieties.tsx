'use client';

import React from 'react';
import Link from 'next/link';
import { SocietyItem } from '../types';
import {
  Terminal,
  Bot,
  Activity,
  Music,
  Camera,
  Users2,
  ChevronRight,
} from 'lucide-react';

interface FeaturedSocietiesProps {
  societies: SocietyItem[];
  selectedSocietyId: string;
  onSelectSociety: (id: string) => void;
}

const getSocietyIcon = (name: string, category: string) => {
  const n = name.toLowerCase();
  if (n.includes('robot')) return Bot;
  if (n.includes('dance')) return Activity;
  if (n.includes('music')) return Music;
  if (n.includes('photo')) return Camera;
  if (n.includes('nss') || category.toLowerCase() === 'social') return Users2;
  return Terminal;
};

export const FeaturedSocieties: React.FC<FeaturedSocietiesProps> = ({
  societies,
  selectedSocietyId,
  onSelectSociety,
}) => {
  return (
    <div id="featured-societies-section">
      <div className="section-header">
        <h2 className="section-title">Featured Societies</h2>
        <Link href="/societies" className="section-view-all">
          <span>View All</span>
          <ChevronRight size={14} />
        </Link>
      </div>

      <div className="featured-societies-grid">
        {societies.map((soc) => {
          const Icon = getSocietyIcon(soc.name, soc.category);
          const isSelected = selectedSocietyId === soc.id;

          return (
            <div
              key={soc.id}
              className={`society-badge-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectSociety(soc.id)}
            >
              <div
                className="society-logo-circle"
                style={{ backgroundColor: soc.logoBg || '#0F172A' }}
              >
                {soc.logoText ? (
                  <span>{soc.logoText}</span>
                ) : (
                  <Icon size={22} color="#FFFFFF" />
                )}
              </div>
              <div className="society-badge-name" title={soc.name}>
                {soc.name}
              </div>
              <div className="society-badge-category">{soc.category}</div>
              <div className="society-badge-count">{soc.memberCount}+ Members</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
