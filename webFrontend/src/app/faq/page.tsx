'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '../../components/Sidebar';
import { HeaderNav } from '../../components/HeaderNav';
import { MobileTopHeader } from '../../components/MobileTopHeader';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import { MobileDrawer } from '../../components/MobileDrawer';
import { FaqItem } from '../../types';
import { api } from '../../services/api';
import { ArrowLeft, ChevronDown, HelpCircle, Mail, Phone } from 'lucide-react';

export default function FaqPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    api.getFaqs().then((data) => {
      setFaqs(data);
      if (data && data.length > 0) {
        setOpenId(data[0].id);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="app-container">
      <Sidebar activeSection="settings" />
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      <div className="main-layout">
        <HeaderNav searchQuery="" onSearchChange={() => {}} />
        <MobileTopHeader
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onToggleSearch={() => {}}
          onOpenNotifications={() => {}}
        />

        <main style={{ padding: '28px', maxWidth: '1000px', width: '100%' }}>
          <div style={{ marginBottom: '24px' }}>
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
              About CampusConnect & FAQ
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Everything you need to know about joining clubs, starting a new student chapter, and student life.
            </p>
          </div>

          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>Loading FAQs...</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {faqs.map((faq) => {
                const isOpen = openId === faq.id;
                return (
                  <div
                    key={faq.id}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid var(--border-light)',
                      overflow: 'hidden',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <button
                      onClick={() => setOpenId(isOpen ? null : faq.id)}
                      style={{
                        width: '100%',
                        padding: '18px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textAlign: 'left',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                      }}
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        size={18}
                        color="var(--text-muted)"
                        style={{
                          transform: isOpen ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s',
                        }}
                      />
                    </button>

                    {isOpen && (
                      <div
                        style={{
                          padding: '0 20px 18px 20px',
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.6,
                          borderTop: '1px solid #F1F5F9',
                          paddingTop: '12px',
                        }}
                      >
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Contact Support Box */}
          <div
            style={{
              marginTop: '36px',
              padding: '24px',
              background: 'linear-gradient(135deg, #EEF2FF 0%, #FAF5FF 100%)',
              borderRadius: '20px',
              border: '1px solid #E0E7FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Have more questions or need help?
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Reach out to the Student Affairs Council or CampusConnect development team.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <a
                href="mailto:support@campusconnect.edu"
                className="apply-btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Mail size={16} />
                <span>Contact SAC</span>
              </a>
            </div>
          </div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
