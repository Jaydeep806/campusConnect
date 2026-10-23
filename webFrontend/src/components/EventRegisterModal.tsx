'use client';

import React, { useState } from 'react';
import { X, CheckCircle, Calendar, MapPin } from 'lucide-react';
import { EventItem } from '../types';
import { useAuth } from '../context/AuthContext';

interface EventRegisterModalProps {
  event: EventItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const EventRegisterModal: React.FC<EventRegisterModalProps> = ({
  event,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [rollNo, setRollNo] = useState(user?.universityRollNumber || '');
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);

  if (!event) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setRegistered(true);
      setSubmitting(false);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    }, 600);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Event Registration</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {event.societyName}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {registered ? (
          <div style={{ textAlign: 'center', padding: '24px 10px' }}>
            <CheckCircle size={44} color="#10B981" style={{ margin: '0 auto 10px auto' }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Registration Confirmed!</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              We look forward to seeing you at {event.title}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div
              style={{
                padding: '12px',
                background: '#F8FAFC',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                marginBottom: '16px',
              }}
            >
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {event.title}
              </h4>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  marginTop: '6px',
                }}
              >
                <Calendar size={13} color="var(--primary)" />
                <span>{event.dateTime}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  marginTop: '4px',
                }}
              >
                <MapPin size={13} color="var(--primary)" />
                <span>{event.location}</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">College Email</label>
                <input
                  type="email"
                  className="form-input"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Roll Number</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? 'Confirming Ticket...' : 'Confirm Registration (Free)'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
