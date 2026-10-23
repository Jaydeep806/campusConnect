'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface HeroBannerProps {
  onExploreClick?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExploreClick }) => {
  return (
    <div className="hero-banner">
      <div className="hero-text-content">
        <div className="hero-subtitle-welcome">Welcome to</div>
        <h1 className="hero-title-gradient">CampusConnect</h1>
        <p className="hero-tagline">
          Explore Clubs • Join Communities • Grow Together
        </p>
        <button
          className="hero-cta-btn"
          onClick={() => {
            if (onExploreClick) onExploreClick();
            else {
              const el = document.getElementById('featured-societies-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          <span>Explore Societies</span>
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="hero-image-wrapper">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/campus_banner.jpg"
          alt="Campus Grounds"
          className="hero-campus-img"
        />
        <div className="hero-floating-quote">
          “Same Campus Bigger Opportunities”
        </div>
      </div>
    </div>
  );
};
