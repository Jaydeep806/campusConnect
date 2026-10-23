'use client';

import React from 'react';
import { ArrowRight, GraduationCap, Sparkles, ShieldCheck } from 'lucide-react';

interface GetStartedViewProps {
  onGetStarted: () => void;
  onAlreadyHaveAccount: () => void;
}

export const GetStartedView: React.FC<GetStartedViewProps> = ({
  onGetStarted,
  onAlreadyHaveAccount,
}) => {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundImage: `url('/images/announcement_bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
        overflow: 'hidden',
        color: '#FFFFFF',
      }}
    >
      {/* Top subtle brand badge */}
      <div
        style={{
          position: 'absolute',
          top: '28px',
          left: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(12px)',
          padding: '10px 20px',
          borderRadius: '999px',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
          zIndex: 20,
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(79, 70, 229, 0.4)',
          }}
        >
          <GraduationCap size={18} />
        </div>
        <div>
          <span style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'block' }}>
            CampusConnect
          </span>
          <span style={{ fontSize: '0.68rem', color: '#CBD5E1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Official Student Portal
          </span>
        </div>
      </div>

      {/* Top right verified pill */}
      <div
        style={{
          position: 'absolute',
          top: '28px',
          right: '32px',
          display: 'none',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(16, 185, 129, 0.2)',
          backdropFilter: 'blur(10px)',
          padding: '6px 14px',
          borderRadius: '999px',
          border: '1px solid rgba(52, 211, 153, 0.35)',
          color: '#A7F3D0',
          fontSize: '0.78rem',
          fontWeight: 700,
          zIndex: 20,
        }}
        className="desktop-only"
      >
        <ShieldCheck size={14} color="#34D399" />
        <span>Verified Campus Network</span>
      </div>

      {/* Deep textured gradient overlay on the lower portion for crisp readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(15, 23, 42, 0.15) 0%, rgba(15, 23, 42, 0.5) 45%, rgba(15, 23, 42, 0.88) 75%, rgba(10, 15, 29, 0.98) 100%)',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      />

      {/* Main Glassmorphic Content Card & Action Buttons */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '560px',
          padding: '0 24px 54px 24px',
          textAlign: 'center',
        }}
      >
        {/* Floating pill badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 16px',
            borderRadius: '999px',
            background: 'rgba(255, 255, 255, 0.14)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            color: '#FFFFFF',
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '14px',
          }}
        >
          <Sparkles size={13} color="#FBBF24" />
          <span>All Campus Clubs & Societies in One Place</span>
        </div>

        <h1
          style={{
            fontSize: '2.3rem',
            fontWeight: 900,
            marginBottom: '12px',
            textShadow: '0 3px 14px rgba(0, 0, 0, 0.6)',
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
          }}
        >
          One Campus, Limitless Connections
        </h1>

        <p
          style={{
            fontSize: '0.98rem',
            color: 'rgba(241, 245, 249, 0.92)',
            marginBottom: '32px',
            lineHeight: 1.6,
            textShadow: '0 1px 4px rgba(0, 0, 0, 0.4)',
          }}
        >
          Explore verified student societies, participate in campus events, and apply for executive positions with your university profile.
        </p>

        {/* Primary 'Get Started' Button -> Takes to Registration */}
        <button
          type="button"
          onClick={onGetStarted}
          style={{
            width: '100%',
            padding: '16px 28px',
            borderRadius: '999px',
            background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 50%, #3B82F6 100%)',
            color: '#FFFFFF',
            fontSize: '1.05rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 8px 25px rgba(79, 70, 229, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2) inset',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            marginBottom: '14px',
            cursor: 'pointer',
            border: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(79, 70, 229, 0.65)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(79, 70, 229, 0.5)';
          }}
        >
          <span>Get Started (Register)</span>
          <ArrowRight size={20} />
        </button>

        {/* Secondary 'I already have an account' Button -> Takes to Login */}
        <button
          type="button"
          onClick={onAlreadyHaveAccount}
          style={{
            width: '100%',
            padding: '14px 28px',
            borderRadius: '999px',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#FFFFFF',
            fontSize: '0.96rem',
            fontWeight: 700,
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          I already have an account (Sign In)
        </button>
      </div>
    </div>
  );
};
