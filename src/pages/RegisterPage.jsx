import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const FIREBASE_ERRORS = {
  'auth/email-already-in-use': 'Este e-mail já está cadastrado. Tente fazer login.',
  'auth/invalid-email': 'E-mail inválido. Verifique o formato.',
  'auth/weak-password': 'Senha fraca. Use pelo menos 6 caracteres.',
  'auth/operation-not-allowed': 'Cadastro com e-mail e senha não está habilitado.',
};

export default function RegisterPage() {
  const { register, user, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  const getPasswordStrength = (pwd) => {
    if (!pwd) return null;
    if (pwd.length < 6) return { level: 'fraca', color: 'var(--danger)', width: '33%' };
    if (pwd.length < 10 || !/[0-9]/.test(pwd)) return { level: 'média', color: 'var(--warning)', width: '66%' };
    return { level: 'forte', color: 'var(--success)', width: '100%' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem. Verifique e tente novamente.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setSubmitting(true);
    try {
      await register(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(FIREBASE_ERRORS[err.code] || 'Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={styles.fullPage}><div style={styles.spinner} /></div>;
  }

  return (
    <div style={styles.fullPage}>
      <div style={styles.bgDecor} aria-hidden="true" />

      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>
            <Logo size={28} strokeColor="white" />
          </div>
        </div>

        <h1 style={styles.title}>Criar conta</h1>
        <p style={styles.subtitle}>Organize seus eventos e listas de convidados</p>

        {error && (
          <div style={styles.errorBox} role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="register-email" className="form-label">E-mail</label>
            <input
              id="register-email"
              type="email"
              className="form-input"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-password" className="form-label">Senha</label>
            <div style={{ position: 'relative' }}>
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                disabled={submitting}
                style={{ paddingRight: '3rem' }}
              />
              <button type="button" onClick={() => setShowPassword(v => !v)} style={styles.eyeBtn} tabIndex={-1}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
                {showPassword
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                }
              </button>
            </div>
            {/* Indicador de força da senha */}
            {strength && (
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ height: '4px', borderRadius: '9999px', background: 'var(--border-color)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: strength.width, background: strength.color, borderRadius: '9999px', transition: 'all 0.3s ease' }} />
                </div>
                <span style={{ fontSize: '0.75rem', color: strength.color, fontWeight: 500, marginTop: '0.25rem', display: 'block' }}>
                  Senha {strength.level}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="register-confirm" className="form-label">Confirmar Senha</label>
            <div style={{ position: 'relative' }}>
              <input
                id="register-confirm"
                type={showConfirm ? 'text' : 'password'}
                className="form-input"
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                disabled={submitting}
                style={{
                  paddingRight: '3rem',
                  borderColor: confirmPassword && confirmPassword !== password ? 'var(--danger)' : undefined,
                }}
              />
              <button type="button" onClick={() => setShowConfirm(v => !v)} style={styles.eyeBtn} tabIndex={-1}
                aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}>
                {showConfirm
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                }
              </button>
            </div>
            {confirmPassword && confirmPassword !== password && (
              <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.25rem', display: 'block' }}>
                As senhas não coincidem
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '0.875rem', fontSize: '1rem' }}
            disabled={submitting}
            id="register-submit"
          >
            {submitting ? (
              <><span style={styles.btnSpinner} />Criando conta...</>
            ) : 'Criar Conta'}
          </button>
        </form>

        <p style={styles.footerText}>
          Já tem uma conta?{' '}
          <Link to="/login" style={styles.linkHighlight}>
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  fullPage: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-color)',
    padding: '1.5rem',
    position: 'relative',
    overflow: 'hidden',
  },
  bgDecor: {
    position: 'fixed',
    bottom: '-20%',
    left: '-10%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(15,23,42,0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    background: 'var(--surface)',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border-color)',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '420px',
    boxShadow: 'var(--shadow-float)',
    position: 'relative',
    zIndex: 1,
  },
  logoWrap: { display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' },
  logoIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 16px rgba(15, 23, 42, 0.25)',
  },
  title: { textAlign: 'center', fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' },
  subtitle: { textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem' },
  errorBox: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)',
    background: 'var(--danger-bg)', color: 'var(--danger-text)',
    fontSize: '0.875rem', marginBottom: '1.5rem',
    border: '1px solid rgba(239, 68, 68, 0.2)',
  },
  eyeBtn: {
    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
    color: 'var(--text-muted)', padding: '0.25rem', display: 'flex', alignItems: 'center', cursor: 'pointer',
  },
  footerText: { textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' },
  linkHighlight: { color: 'var(--primary)', fontWeight: 600 },
  spinner: {
    width: '40px', height: '40px', border: '3px solid var(--border-color)',
    borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite',
  },
  btnSpinner: {
    display: 'inline-block', width: '16px', height: '16px',
    border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white',
    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
  },
};
