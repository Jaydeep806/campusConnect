'use client';

import React from 'react';
import Link from 'next/link';
import {
  ListFilter,
  CalendarCheck,
  Megaphone,
  HelpCircle,
} from 'lucide-react';

const PAGES = [
  {
    id: 'societies',
    title: 'All Societies List',
    desc: 'Search, filter, categories',
    href: '/societies',
    icon: ListFilter,
  },
  {
    id: 'events',
    title: 'Events Page',
    desc: 'All upcoming events by societies',
    href: '/events',
    icon: CalendarCheck,
  },
  {
    id: 'announcements',
    title: 'Announcements',
    desc: 'Important updates & notices',
    href: '/announcements',
    icon: Megaphone,
  },
  {
    id: 'faq',
    title: 'About Us / FAQ',
    desc: 'How to join, guidelines, contact',
    href: '/faq',
    icon: HelpCircle,
  },
];

export const OtherPagesGrid: React.FC = () => {
  return (
    <div>
      <div className="section-header">
        <h3 className="section-title">Other Important Pages</h3>
      </div>
      <div className="other-pages-grid">
        {PAGES.map((page) => {
          const Icon = page.icon;
          return (
            <Link key={page.id} href={page.href} className="other-page-card">
              <div className="other-page-icon">
                <Icon size={20} />
              </div>
              <div className="other-page-title">{page.title}</div>
              <div className="other-page-desc">{page.desc}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
