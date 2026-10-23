'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '../../components/Sidebar';
import { HeaderNav } from '../../components/HeaderNav';
import { MobileTopHeader } from '../../components/MobileTopHeader';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import { MobileDrawer } from '../../components/MobileDrawer';
import { ArrowLeft, MessageSquare, Send, Hash } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { SocietyItem } from '../../types';

export default function MessagesPage() {
  const { user } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [societies, setSocieties] = useState<SocietyItem[]>([]);
  const [activeChat, setActiveChat] = useState<string>('General Campus');
  const [inputText, setInputText] = useState('');
  const [chatHistory, setChatHistory] = useState<Record<string, Array<{ sender: string; time: string; text: string }>>>({
    'General Campus': [
      { sender: 'Campus Admin', time: '9:00 AM', text: 'Welcome to CampusConnect community discussions! Reach out here for inquiries.' },
    ],
  });

  useEffect(() => {
    api.getSocieties().then((data) => {
      setSocieties(data);
      if (data.length > 0) {
        const first = `${data[0].name} Channel`;
        setActiveChat(first);
        setChatHistory((prev) => ({
          ...prev,
          [first]: [
            { sender: `${data[0].name} Lead`, time: '10:00 AM', text: `Welcome to the official ${data[0].name} inquiry channel!` },
          ],
        }));
      }
    });
  }, []);

  const currentMessages = chatHistory[activeChat] || [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const newMsg = {
      sender: user?.fullName || 'You',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: inputText.trim(),
    };
    setChatHistory((prev) => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), newMsg],
    }));
    setInputText('');
  };

  const handleSelectChannel = (name: string) => {
    setActiveChat(name);
    if (!chatHistory[name]) {
      setChatHistory((prev) => ({
        ...prev,
        [name]: [
          { sender: `${name} Lead`, time: '10:00 AM', text: `Welcome to the ${name} discussion channel!` },
        ],
      }));
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeSection="messages" />
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      <div className="main-layout">
        <HeaderNav searchQuery="" onSearchChange={() => {}} />
        <MobileTopHeader
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onToggleSearch={() => {}}
          onOpenNotifications={() => {}}
        />

        <main style={{ padding: '28px', maxWidth: '1280px', width: '100%' }}>
          <div style={{ marginBottom: '20px' }}>
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
              Society Channels & Messages
            </h1>
          </div>

          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid var(--border-light)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
              display: 'grid',
              gridTemplateColumns: '260px 1fr',
              height: '560px',
            }}
          >
            {/* Conversations list */}
            <div style={{ borderRight: '1px solid var(--border-light)', padding: '16px', overflowY: 'auto' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px' }}>
                ACTIVE CLUB CHANNELS
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: activeChat === 'General Campus' ? '#EEF2FF' : 'transparent',
                  color: activeChat === 'General Campus' ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  marginBottom: '4px',
                }}
                onClick={() => handleSelectChannel('General Campus')}
              >
                <Hash size={14} />
                <span>General Campus</span>
              </div>
              {societies.map((soc) => {
                const channelName = `${soc.name} Channel`;
                const isSelected = activeChat === channelName;
                return (
                  <div
                    key={soc.id}
                    onClick={() => handleSelectChannel(channelName)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      fontWeight: isSelected ? 700 : 500,
                      background: isSelected ? '#EEF2FF' : 'transparent',
                      color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      marginTop: '4px',
                    }}
                  >
                    <Hash size={14} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {soc.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Chat Box */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', fontWeight: 700, fontSize: '0.95rem' }}>
                {activeChat}
              </div>

              <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {currentMessages.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      alignSelf: m.sender === (user?.fullName || 'You') ? 'flex-end' : 'flex-start',
                      maxWidth: '75%',
                      background: m.sender === (user?.fullName || 'You') ? 'var(--primary-gradient)' : '#F1F5F9',
                      color: m.sender === (user?.fullName || 'You') ? '#FFFFFF' : 'var(--text-main)',
                      padding: '10px 16px',
                      borderRadius: '16px',
                      fontSize: '0.85rem',
                      lineHeight: 1.5,
                    }}
                  >
                    <div style={{ fontSize: '0.68rem', opacity: 0.8, marginBottom: '2px', fontWeight: 600 }}>
                      {m.sender} • {m.time}
                    </div>
                    {m.text}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSend} style={{ display: 'flex', padding: '14px 20px', borderTop: '1px solid var(--border-light)', gap: '10px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type a message to this channel..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <button type="submit" className="apply-btn-primary" style={{ padding: '0 16px' }}>
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
