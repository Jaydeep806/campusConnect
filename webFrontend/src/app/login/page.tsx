'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, ArrowLeft, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams?.get('mode');
  const { loginAsStudent, loginAsClub, loginAsAdmin, registerStudent } = useAuth();

  const [role, setRole] = useState<'student' | 'club' | 'admin'>('student');
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [email, setEmail] = useState('sam@example.edu');
  const [password, setPassword] = useState('password123');

  // Student register extra fields
  const [fullName, setFullName] = useState('Riya Kumari');
  const [username, setUsername] = useState('riyak');
  const [rollNo, setRollNo] = useState('22CS104');
  const [phone, setPhone] = useState('+919876543210');
  const [batchYear, setBatchYear] = useState('2026');

  // Admin ID
  const [adminId, setAdminId] = useState('campus-admin');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialMode === 'register') {
      setIsRegister(true);
    } else if (initialMode === 'login') {
      setIsRegister(false);
    }
  }, [initialMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isRegister) {
        const res = await registerStudent({
          fullName,
          username,
          email,
          password,
          batchYear: parseInt(batchYear) || 2026,
          universityRollNumber: rollNo,
          phoneNumber: phone,
        });
        if (res.success) {
          setSuccessMsg('Registration successful! Redirecting to dashboard...');
          setTimeout(() => router.push('/'), 1000);
        } else {
          setErrorMsg(res.message || 'Registration failed');
        }
      } else {
        let res;
        if (role === 'student') {
          res = await loginAsStudent(email, password);
        } else if (role === 'club') {
          res = await loginAsClub(email, password);
        } else {
          res = await loginAsAdmin(adminId, password);
        }

        if (res.success) {
          setSuccessMsg('Signed in successfully! Redirecting...');
          setTimeout(() => router.push('/'), 800);
        } else {
          setErrorMsg(res.message || 'Invalid credentials');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #EEF2FF 0%, #FAF5FF 50%, #F1F5F9 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px', marginBottom: '16px' }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: '#FFFFFF',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-light)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              margin: '0 auto 12px auto',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
            }}
          >
            <GraduationCap size={26} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
            CampusConnect
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {isRegister ? 'Create your official student account' : 'Sign in to access your clubs, events & applications'}
          </p>
        </div>

        {/* Tab Toggle: Sign In vs Create Account */}
        <div
          style={{
            display: 'flex',
            background: '#F1F5F9',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '20px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setErrorMsg(null);
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: 700,
              background: !isRegister ? '#FFFFFF' : 'transparent',
              color: !isRegister ? 'var(--primary)' : 'var(--text-secondary)',
              boxShadow: !isRegister ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setErrorMsg(null);
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: 700,
              background: isRegister ? '#FFFFFF' : 'transparent',
              color: isRegister ? 'var(--primary)' : 'var(--text-secondary)',
              boxShadow: isRegister ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Create Account
          </button>
        </div>

        {/* Role Selector Tabs (when in Sign In mode) */}
        {!isRegister && (
          <div
            style={{
              display: 'flex',
              background: '#F8FAFC',
              borderRadius: '10px',
              padding: '3px',
              border: '1px solid var(--border-light)',
              marginBottom: '20px',
            }}
          >
            {(['student', 'club', 'admin'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setRole(r);
                  if (r === 'student') {
                    setEmail('sam@example.edu');
                    setPassword('password123');
                  } else if (r === 'club') {
                    setEmail('acm@example.edu');
                    setPassword('password123');
                  } else {
                    setAdminId('campus-admin');
                    setPassword('adminPassword123!');
                  }
                }}
                style={{
                  flex: 1,
                  padding: '6px 4px',
                  borderRadius: '7px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textTransform: 'capitalize',
                  background: role === r ? 'var(--primary)' : 'transparent',
                  color: role === r ? '#FFFFFF' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease',
                }}
              >
                {r === 'club' ? 'Club Lead' : r}
              </button>
            ))}
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
              color: '#DC2626',
              fontSize: '0.82rem',
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '10px',
              background: '#ECFDF5',
              border: '1px solid #D1FAE5',
              color: '#059669',
              fontSize: '0.82rem',
              marginBottom: '16px',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister ? (
            /* Student Registration Fields */
            <>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Riya Kumari"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Username</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="riyak"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Roll Number</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="22CS104"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Batch Year</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    placeholder="2026"
                    value={batchYear}
                    onChange={(e) => setBatchYear(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Phone (+91...)</label>
                  <input
                    type="tel"
                    className="form-input"
                    required
                    placeholder="+919876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Student Email</label>
                <input
                  type="email"
                  className="form-input"
                  required
                  placeholder="riya@example.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Password (min 8 characters)</label>
                <input
                  type="password"
                  className="form-input"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </>
          ) : (
            /* Sign In Fields */
            <>
              {role === 'admin' ? (
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Admin ID</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                  />
                </div>
              ) : (
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    {role === 'club' ? 'Club Lead Email' : 'Student Email'}
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Password</label>
                <input
                  type="password"
                  className="form-input"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Authenticating...' : isRegister ? 'Create Student Account' : `Sign In as ${role === 'club' ? 'Club Lead' : role}`}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {isRegister ? (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                style={{ color: 'var(--primary)', fontWeight: 700 }}
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              Don’t have a student account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                style={{ color: 'var(--primary)', fontWeight: 700 }}
              >
                Create Account
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-app)',
          }}
        >
          Loading...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
