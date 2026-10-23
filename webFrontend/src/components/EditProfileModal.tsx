'use client';

import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface EditProfileModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ onClose, onSuccess }) => {
  const { user, role } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || user?.clubName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [rollNo, setRollNo] = useState(user?.universityRollNumber || '');
  const [batchYear, setBatchYear] = useState(String(user?.batchYear || user?.foundedYear || '2026'));
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [tagline, setTagline] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (role === 'club') {
        await api.updateClubProfile({
          name: fullName || undefined,
          tagline: tagline.trim() || undefined,
          logoUrl: avatarUrl.trim() || undefined,
        });
      }
      if (typeof window !== 'undefined') {
        const updated = {
          ...user,
          fullName: fullName || user?.fullName,
          email,
          phoneNumber: phone,
          universityRollNumber: rollNo,
          batchYear: parseInt(batchYear) || 2026,
          avatarUrl,
        };
        localStorage.setItem('cc_user', JSON.stringify(updated));
      }
      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              {role === 'club' ? 'Edit Club Profile' : 'Edit Student Profile'}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Update your account details and contact information.
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '24px 10px' }}>
            <CheckCircle size={44} color="#10B981" style={{ margin: '0 auto 10px auto' }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Profile Updated!</h4>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{role === 'club' ? 'Club Name' : 'Full Name'}</label>
              <input
                type="text"
                className="form-input"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            {role === 'club' && (
              <div className="form-group">
                <label className="form-label">Club Tagline</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Advancing Computing as a Science & Profession"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  disabled
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {role !== 'club' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">University Roll Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Batch Year</label>
                  <input
                    type="text"
                    className="form-input"
                    value={batchYear}
                    onChange={(e) => setBatchYear(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">{role === 'club' ? 'Club Logo / Image URL' : 'Avatar Photo URL'}</label>
              <input
                type="url"
                className="form-input"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
