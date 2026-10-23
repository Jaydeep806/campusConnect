'use client';

import React, { useState } from 'react';
import { X, CheckCircle, Plus, Trash2, AlertCircle } from 'lucide-react';
import { SocietyItem } from '../types';
import { api } from '../services/api';

interface StartHiringModalProps {
  society: SocietyItem;
  onClose: () => void;
  onSuccess: (updatedRecruitment: any) => void;
}

export const StartHiringModal: React.FC<StartHiringModalProps> = ({
  society,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('Recruitment 2026-2027');
  const [description, setDescription] = useState('Join our core committee and lead campus initiatives.');
  const [lastDate, setLastDate] = useState('');
  const [googleFormUrl, setGoogleFormUrl] = useState('');
  const [positions, setPositions] = useState([
    { title: 'Web Development', seats: 3 },
    { title: 'UI/UX Design', seats: 2 },
    { title: 'Content Writing', seats: 2 },
  ]);
  const [newTitle, setNewTitle] = useState('');
  const [newSeats, setNewSeats] = useState('2');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
      setErrorMsg('Please add at least one open position');
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await api.createClubRecruitment({
        title,
        description,
        positions,
        lastDate: lastDate || undefined,
        googleFormUrl: googleFormUrl || undefined,
      });

      setSubmitted(true);
      setTimeout(() => {
        onSuccess(res.recruitment);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to open recruitment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Start Recruitment Drive</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Open recruitments for {society.name}.
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '24px 10px' }}>
            <CheckCircle size={44} color="#10B981" style={{ margin: '0 auto 10px auto' }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Recruitment Opened!</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Your club recruitment is now active for all students.
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
                  fontSize: '0.8rem',
                  marginBottom: '16px',
                }}
              >
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Recruitment Drive Title</label>
              <input
                type="text"
                className="form-input"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description / Instructions</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Application Deadline</label>
                <input
                  type="date"
                  className="form-input"
                  value={lastDate}
                  onChange={(e) => setLastDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">External Google Form (Optional)</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://forms.google.com/..."
                  value={googleFormUrl}
                  onChange={(e) => setGoogleFormUrl(e.target.value)}
                />
              </div>
            </div>

            <div style={{ margin: '14px 0' }}>
              <label className="form-label">Open Positions & Seats</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Position Name (e.g. Graphic Designer)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ flex: 2 }}
                />
                <input
                  type="number"
                  className="form-input"
                  placeholder="Seats"
                  value={newSeats}
                  onChange={(e) => setNewSeats(e.target.value)}
                  style={{ width: '80px' }}
                />
                <button
                  type="button"
                  onClick={handleAddPosition}
                  className="apply-btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={16} /> Add
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {positions.map((pos, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#F1F5F9',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                    }}
                  >
                    <span>{pos.title} ({pos.seats} seats)</span>
                    <Trash2
                      size={13}
                      color="#EF4444"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleRemovePosition(idx)}
                    />
                  </span>
                ))}
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? 'Publishing Recruitment...' : 'Open Recruitment Drive'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
