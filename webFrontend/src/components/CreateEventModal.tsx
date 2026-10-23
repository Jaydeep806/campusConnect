'use client';

import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface CreateEventModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [mode, setMode] = useState<'in-person' | 'online' | 'hybrid'>('in-person');
  const [regUrl, setRegUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      let isoDate = dateTime;
      if (!dateTime) {
        isoDate = new Date(Date.now() + 7 * 86400000).toISOString();
      } else {
        const d = new Date(dateTime);
        if (isNaN(d.getTime())) {
          isoDate = new Date(Date.now() + 7 * 86400000).toISOString();
        } else {
          isoDate = d.toISOString();
        }
      }

      await api.createClubEvent({
        title,
        summary,
        description: description || summary,
        location,
        startsAt: isoDate,
        mode,
        registrationUrl: regUrl.trim() || undefined,
      });
      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Create Club Event</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Publish a workshop, hackathon, or meetup for students.
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '24px 10px' }}>
            <CheckCircle size={44} color="#10B981" style={{ margin: '0 auto 10px auto' }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Event Created!</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Your event is now live and listed in the Upcoming Events feed.
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
              <label className="form-label">Event Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. AI & Full-Stack Bootcamp"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Short Summary</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Brief highlight of the event"
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Date & Time</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  required
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mode</label>
                <select
                  className="form-select"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as any)}
                >
                  <option value="in-person">In-Person</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Location / Platform Venue</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. ACM Lab, Block A or Google Meet"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Registration URL (Optional)</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://forms.google.com/..."
                value={regUrl}
                onChange={(e) => setRegUrl(e.target.value)}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? 'Publishing Event...' : 'Publish Event'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
