'use client';

import React, { useState } from 'react';
import { X, CheckCircle, Plus, Trash2, AlertCircle, Briefcase, Calendar, Link as LinkIcon } from 'lucide-react';
import { api } from '../services/api';

interface EditRecruitmentModalProps {
  recruitment: any;
  onClose: () => void;
  onSuccess: () => void;
  onDelete?: () => void;
}

export const EditRecruitmentModal: React.FC<EditRecruitmentModalProps> = ({
  recruitment,
  onClose,
  onSuccess,
  onDelete,
}) => {
  const [title, setTitle] = useState(recruitment.title || 'Recruitment Drive');
  const [description, setDescription] = useState(
    recruitment.description || 'Active recruitment drive for new club members.'
  );
  const [lastDate, setLastDate] = useState(() => {
    if (recruitment.closesAt) {
      try {
        return new Date(recruitment.closesAt).toISOString().split('T')[0];
      } catch {}
    }
    if (recruitment.lastDate) {
      try {
        const d = new Date(recruitment.lastDate);
        if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
      } catch {}
    }
    return '';
  });
  const [googleFormUrl, setGoogleFormUrl] = useState(
    recruitment.googleFormUrl || recruitment.applicationUrl || ''
  );
  const [status, setStatus] = useState<'open' | 'closed'>(
    recruitment.status === 'closed' ? 'closed' : 'open'
  );
  const [positions, setPositions] = useState<Array<{ title: string; seats: number }>>(
    recruitment.positions && recruitment.positions.length > 0
      ? recruitment.positions.map((p: any) => ({
          title: p.title || 'Position',
          seats: Number(p.seats) || 1,
        }))
      : [{ title: 'Core Member', seats: 3 }]
  );

  const [newTitle, setNewTitle] = useState('');
  const [newSeats, setNewSeats] = useState('2');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const targetId = (recruitment?.id || recruitment?._id)?.toString();

  const handleAddPosition = () => {
    if (!newTitle.trim()) return;
    setPositions([...positions, { title: newTitle.trim(), seats: parseInt(newSeats) || 1 }]);
    setNewTitle('');
  };

  const handleRemovePosition = (idx: number) => {
    setPositions(positions.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (positions.length === 0) {
      setErrorMsg('Please keep or add at least one open position');
      return;
    }
    if (!targetId || targetId === 'undefined') {
      setErrorMsg('Invalid recruitment ID. Please refresh the page and try again.');
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);

    try {
      await api.updateClubRecruitment(targetId, {
        title,
        description,
        positions,
        lastDate: lastDate || undefined,
        googleFormUrl: googleFormUrl || undefined,
        status,
      });

      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update recruitment drive');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!targetId || targetId === 'undefined') {
      setErrorMsg('Invalid recruitment ID. Please refresh the page.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete the recruitment drive "${title}"?`)) {
      return;
    }
    setDeleting(true);
    setErrorMsg(null);
    try {
      await api.deleteClubRecruitment(targetId);
      if (onDelete) onDelete();
      else onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete recruitment drive');
      setDeleting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Edit Recruitment Drive</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Configure open positions, deadlines, and application links.
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '28px 12px' }}>
            <CheckCircle size={48} color="#10B981" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Recruitment Drive Updated!</h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Your recruitment settings and open positions have been saved.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {errorMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: '#FEF2F2',
                  border: '1px solid #FEE2E2',
                  color: '#B91C1C',
                  fontSize: '0.82rem',
                  marginBottom: '16px',
                }}
              >
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                  Drive Title
                </label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Core Committee Hiring 2026-2027"
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                  Status
                </label>
                <select
                  className="form-input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                >
                  <option value="open">Open (Accepting)</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                Drive Overview / Instructions
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe team responsibilities, benefits, and candidate expectations..."
              />
            </div>

            {/* Open Positions List & Add Input */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                <span>Open Positions ({positions.length})</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Role & Openings</span>
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                {positions.map((pos, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: '#F8FAFC',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{pos.title}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--primary)', marginLeft: '8px', fontWeight: 600 }}>
                        {pos.seats} {pos.seats === 1 ? 'seat' : 'seats'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePosition(idx)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#EF4444',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Position Name (e.g. Graphic Designer)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ flex: 1 }}
                />
                <input
                  type="number"
                  className="form-input"
                  placeholder="Seats"
                  value={newSeats}
                  onChange={(e) => setNewSeats(e.target.value)}
                  style={{ width: '80px' }}
                  min={1}
                />
                <button
                  type="button"
                  onClick={handleAddPosition}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: '#EEF2FF',
                    color: 'var(--primary)',
                    border: '1px solid #C7D2FE',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Plus size={16} /> Add
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '22px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                  Application Deadline
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={lastDate}
                  onChange={(e) => setLastDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                  Google Form Link (Optional)
                </label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://forms.gle/..."
                  value={googleFormUrl}
                  onChange={(e) => setGoogleFormUrl(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || submitting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#DC2626',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Trash2 size={16} />
                <span>{deleting ? 'Deleting...' : 'Delete Drive'}</span>
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    background: 'var(--bg-muted)',
                    border: '1px solid var(--border-light)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={submitting || deleting}
                  style={{ minWidth: '150px' }}
                >
                  {submitting ? 'Saving Changes...' : 'Save & Update'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
