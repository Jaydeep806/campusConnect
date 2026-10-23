'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '../../components/Sidebar';
import { HeaderNav } from '../../components/HeaderNav';
import { MobileTopHeader } from '../../components/MobileTopHeader';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import { MobileDrawer } from '../../components/MobileDrawer';
import { ArrowLeft, Users, Mail, Linkedin, Plus, Trash2 } from 'lucide-react';
import { SocietyItem } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function MembersPage() {
  const { role, user } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [societies, setSocieties] = useState<SocietyItem[]>([]);
  const [clubMembers, setClubMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Member State for Club Leads
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [memberRole, setMemberRole] = useState('');
  const [batchYear, setBatchYear] = useState('2026');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [role]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (role === 'club') {
        const members = await api.getClubMembers();
        setClubMembers(members);
      } else {
        const data = await api.getSocieties();
        setSocieties(data);
      }
    } catch (err) {
      console.warn('Error loading members data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !memberRole.trim()) return;
    setSubmitting(true);
    try {
      await api.addClubMember({
        name,
        role: memberRole,
        batchYear: parseInt(batchYear) || 2026,
        imageUrl: imageUrl.trim() || undefined,
      });
      setName('');
      setMemberRole('');
      setImageUrl('');
      setIsAdding(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to add member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member from the team?')) return;
    try {
      await api.deleteClubMember(memberId);
      setClubMembers((prev) => prev.filter((m) => (m.id || m._id) !== memberId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete member');
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeSection="members" />
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      <div className="main-layout">
        <HeaderNav searchQuery="" onSearchChange={() => {}} />
        <MobileTopHeader
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onToggleSearch={() => {}}
          onOpenNotifications={() => {}}
        />

        <main style={{ padding: '28px', maxWidth: '1280px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
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
                {role === 'club' ? 'Club Committee & Member Roster' : 'Campus Leadership & Team Directory'}
              </h1>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {role === 'club'
                  ? 'Manage your executive leads, core team coordinators, and active batch members.'
                  : 'Connect with club presidents, technical leads, and student coordinators.'}
              </p>
            </div>

            {role === 'club' && (
              <button
                className="apply-btn-primary"
                onClick={() => setIsAdding(!isAdding)}
              >
                <Plus size={16} />
                <span>{isAdding ? 'Cancel' : 'Add Team Member'}</span>
              </button>
            )}
          </div>

          {isAdding && role === 'club' && (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid var(--border-light)',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>
                Add New Core Member
              </h3>
              <form onSubmit={handleAddMember}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Sneha Patel"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Technical Lead"
                      required
                      value={memberRole}
                      onChange={(e) => setMemberRole(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Batch Year</label>
                    <input
                      type="number"
                      className="form-input"
                      value={batchYear}
                      onChange={(e) => setBatchYear(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Photo URL (Optional)</label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                  </div>
                </div>
                <button type="submit" className="submit-btn" disabled={submitting} style={{ width: 'auto', padding: '10px 24px', marginTop: '10px' }}>
                  {submitting ? 'Adding...' : 'Save Member'}
                </button>
              </form>
            </div>
          )}

          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>Loading member roster...</div>
            </div>
          ) : role === 'club' ? (
            clubMembers.length === 0 ? (
              <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)', background: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                <Users size={40} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>No team members listed yet</div>
                <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Click "Add Team Member" to add your core committee.</p>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '16px',
                }}
              >
                {clubMembers.map((m) => (
                  <div
                    key={m.id || m._id}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid var(--border-light)',
                      padding: '20px',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      position: 'relative',
                    }}
                  >
                    <button
                      onClick={() => handleDeleteMember(m.id || m._id)}
                      title="Remove member"
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: '#FEF2F2',
                        border: '1px solid #FECACA',
                        color: '#DC2626',
                        borderRadius: '6px',
                        padding: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        m.imageUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                      }
                      alt={m.name}
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '999px',
                        objectFit: 'cover',
                        marginBottom: '12px',
                        border: '3px solid #EEF2FF',
                      }}
                    />
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {m.name}
                    </h4>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', marginTop: '2px' }}>
                      {m.role}
                    </div>
                    {m.batchYear && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Batch of {m.batchYear}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px',
              }}
            >
              {societies.map((soc) => (
                <div
                  key={soc.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid var(--border-light)',
                    padding: '20px',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '999px',
                      background: soc.logoBg || '#0F172A',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.2rem',
                      marginBottom: '12px',
                    }}
                  >
                    {soc.logoText}
                  </div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {soc.name}
                  </h4>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', marginTop: '2px' }}>
                    {soc.category} Society
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {soc.memberCount}+ Members • Founded {soc.foundedYear}
                  </div>

                  <Link
                    href={`/societies`}
                    className="apply-btn-primary"
                    style={{ marginTop: '16px', fontSize: '0.75rem', padding: '6px 14px' }}
                  >
                    View Society Profile
                  </Link>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
