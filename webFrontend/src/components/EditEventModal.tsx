'use client';

import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, Trash2, Calendar, MapPin, Globe } from 'lucide-react';
import { EventItem } from '../types';
import { api } from '../services/api';

interface EditEventModalProps {
  event: EventItem;
  onClose: () => void;
  onSuccess: () => void;
  onDelete?: () => void;
}

export const EditEventModal: React.FC<EditEventModalProps> = ({
  event,
  onClose,
  onSuccess,
  onDelete,
}) => {
  const [title, setTitle] = useState(event.title || '');
  const [summary, setSummary] = useState(event.summary || '');
  const [description, setDescription] = useState(event.description || event.summary || '');
  const [location, setLocation] = useState(event.location || '');
  const [mode, setMode] = useState<'in-person' | 'online' | 'hybrid'>(
    event.mode === 'online' || event.mode === 'hybrid' ? event.mode : 'in-person'
  );
  const [dateTime, setDateTime] = useState(() => {
    const raw = (event as any).startsAt || event.dateTime;
    if (raw) {
      try {
        const d = new Date(raw);
        if (!isNaN(d.getTime())) {
          return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        }
      } catch {}
    }
    return '';
  });
  const [regUrl, setRegUrl] = useState(event.registrationUrl || '');

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const targetId = (event?.id || (event as any)?._id)?.toString();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId || targetId === 'undefined' || targetId === 'null') {
      setErrorMsg('Invalid event ID. Please refresh the page and try again.');
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);

    try {
      let isoDate: string | undefined = undefined;
      if (dateTime.trim()) {
        const d = new Date(dateTime);
        if (!isNaN(d.getTime())) {
          isoDate = d.toISOString();
        }
      }

      await api.updateClubEvent(targetId, {
        title,
        summary,
        description: description || summary,
        location,
        mode,
        ...(isoDate ? { startsAt: isoDate } : {}),
        registrationUrl: regUrl.trim() || undefined,
      });

      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!targetId || targetId === 'undefined' || targetId === 'null') {
      setErrorMsg('Invalid event ID. Please refresh the page.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete the event "${event.title}"?`)) {
      return;
    }
    setDeleting(true);
    setErrorMsg(null);
    try {
      await api.deleteClubEvent(targetId);
      if (onDelete) onDelete();
      else onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete event');
      setDeleting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Edit Club Event</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Update schedule, venue, mode, or details for your club event.
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '28px 12px' }}>
            <CheckCircle size={48} color="#10B981" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Event Updated Successfully!</h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Changes have been saved and published to the campus events calendar.
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

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                Event Title
              </label>
              <input
                type="text"
                className="form-input"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. AI & Cloud Architecture Workshop"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                  Event Mode
                </label>
                <select
                  className="form-input"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as any)}
                >
                  <option value="in-person">In-Person (On Campus)</option>
                  <option value="online">Online (Virtual Stream)</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                  Update Date & Time
                </label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                Venue / Platform Location
              </label>
              <input
                type="text"
                className="form-input"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Tech Auditorium Hall B or Zoom Link"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                Short Summary (1-2 sentences)
              </label>
              <input
                type="text"
                className="form-input"
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Brief takeaway for student card previews"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                Full Description & Agenda
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comprehensive agenda, prerequisites, speaker names, and guidelines..."
              />
            </div>

            <div className="form-group" style={{ marginBottom: '22px' }}>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                External Registration URL (Optional)
              </label>
              <input
                type="url"
                className="form-input"
                value={regUrl}
                onChange={(e) => setRegUrl(e.target.value)}
                placeholder="https://forms.gle/... or Google Form link"
              />
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
                <span>{deleting ? 'Deleting...' : 'Delete Event'}</span>
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
