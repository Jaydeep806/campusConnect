'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Building2, Users, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export const AdminDashboardView: React.FC = () => {
  const [pendingClubs, setPendingClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    setLoading(true);
    try {
      const clubs = await api.getPendingClubs();
      setPendingClubs(clubs);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, name: string) => {
    await api.approveClub(id);
    setPendingClubs((prev) => prev.filter((c) => c.id !== id));
    setMessage(`"${name}" has been approved! Club lead credentials are now active.`);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleReject = async (id: string, name: string) => {
    await api.rejectClub(id);
    setPendingClubs((prev) => prev.filter((c) => c.id !== id));
    setMessage(`"${name}" registration request was declined.`);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <main style={{ padding: '28px', maxWidth: '1280px', width: '100%', margin: '0 auto' }}>
      {/* Admin Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: '24px',
          padding: '28px 32px',
          color: '#FFFFFF',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
          }}
        >
          <ShieldCheck size={32} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Campus Administration</h1>
            <span
              style={{
                background: 'rgba(239, 68, 68, 0.25)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#FCA5A5',
              }}
            >
              ADMINISTRATOR
            </span>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#94A3B8', marginTop: '4px' }}>
            Verify new student club registrations, oversee recruitment guidelines, and manage college societies.
          </p>
        </div>
      </div>

      {message && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '12px',
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#059669',
            fontSize: '0.88rem',
            fontWeight: 600,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {/* Pending Clubs List */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid var(--border-light)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
              Pending Club Applications ({pendingClubs.length})
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Clubs waiting for SAC validation before their profiles go live on CampusConnect.
            </p>
          </div>
        </div>

        {pendingClubs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={48} color="#10B981" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
              All Caught Up!
            </h3>
            <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>
              There are no pending club registrations awaiting administrative approval.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pendingClubs.map((club) => (
              <div
                key={club.id}
                style={{
                  background: '#F8FAFC',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {club.clubName}
                    </h3>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '999px',
                        background: '#EEF2FF',
                        color: 'var(--primary)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                      }}
                    >
                      {club.category}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Representative: <strong>{club.representative}</strong> ({club.email}) • Founded Year: {club.foundedYear}
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    {club.description}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleReject(club.id, club.clubName)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid #FECACA',
                      background: '#FEF2F2',
                      color: '#DC2626',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                    }}
                  >
                    <XCircle size={15} />
                    <span>Decline</span>
                  </button>

                  <button
                    onClick={() => handleApprove(club.id, club.clubName)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 18px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      color: '#FFFFFF',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                    }}
                  >
                    <CheckCircle2 size={15} />
                    <span>Approve & Activate</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};
