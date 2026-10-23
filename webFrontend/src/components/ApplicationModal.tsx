'use client';

import React, { useState } from 'react';
import { X, CheckCircle, ExternalLink, AlertCircle } from 'lucide-react';
import { SocietyItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface ApplicationModalProps {
  society: SocietyItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  society,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [department, setDepartment] = useState('Computer Science');
  const [batchYear, setBatchYear] = useState(String(user?.batchYear || '2026'));
  const [position, setPosition] = useState(
    society?.recruitment?.positions[0]?.title || 'Core Member'
  );
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!society) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await api.submitApplication({
        fullName,
        email,
        phone,
        department,
        batchYear,
        positionTitle: position,
        coverLetter,
        societyId: society.id,
        societyName: society.name,
        recruitmentId: society.recruitment?.id,
      });
      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const googleFormUrl = society.recruitment?.googleFormUrl;
  const positions = society.recruitment?.positions && society.recruitment.positions.length > 0
    ? society.recruitment.positions
    : [{ title: 'Core Member', seats: 5 }, { title: 'Executive Coordinator', seats: 2 }];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Apply to {society.name}</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {society.recruitment?.title || 'Recruitment Season'}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <CheckCircle size={48} color="#10B981" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Application Submitted!</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
              Your application has been received. You can track status in Applications.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {googleFormUrl && (
              <div
                style={{
                  background: '#EEF2FF',
                  border: '1px solid #C7D2FE',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <div style={{ fontSize: '0.78rem', color: 'var(--primary)' }}>
                  This club also provides an external Google Form for applications.
                </div>
                <a
                  href={googleFormUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span>Open Form</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            )}

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
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Position Applying For</label>
                <select
                  className="form-select"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                >
                  {positions.map((p, idx) => (
                    <option key={idx} value={p.title}>
                      {p.title} ({p.seats} seats)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Why are you interested in joining?</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Briefly describe your relevant experience, interests, or project goals..."
                required
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
