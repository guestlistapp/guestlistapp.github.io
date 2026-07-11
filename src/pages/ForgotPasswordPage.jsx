import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const FIREBASE_ERRORS = {
  'auth/user-not-found': 'Nenhuma conta encontrada com este e-mail.',
  'auth/invalid-email': 'E-mail inválido. Verifique o formato.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.',
};

export default function ForgotPasswordPage() {
  const { forgotPassword, user, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSubmitting(true);

    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      // Por segurança, o Firebase às vezes não retorna erro quando o email não existe.
      // Exibimos sucesso de qualquer forma para não revelar se o email está cadastrado.
      if (err.code === 'auth/user-not-found') {
        setSuccess(true);
      } else {
        setError(FIREBASE_ERRORS[err.code] || 'Ocorreu um erro inesperado. Tente novamente.');
      }
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

        <h1 style={styles.title}>Recuperar senha</h1>
        <p style={styles.subtitle}>
          Informe seu e-mail e enviaremos um link para redefinir sua senha.
        </p>

        {error && (
          <div style={styles.errorBox} role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {success ? (
          <div style={styles.successBox} role="status">
            <div style={styles.successIconWrap}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--success-text)' }}>
              E-mail enviado!
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
              Se esse e-mail estiver cadastrado, você receberá as instruções em breve. Verifique também a caixa de spam.
            </p>
            <Link to="/login" style={{ ...styles.linkHighlight, marginTop: '1.5rem', display: 'inline-block' }}>
              ← Voltar para o login
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="forgot-email" className="form-label">E-mail</label>
                <input
                  id="forgot-email"
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

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', padding: '0.875rem', fontSize: '1rem' }}
                disabled={submitting}
                id="forgot-submit"
              >
                {submitting ? (
                  <><span style={styles.btnSpinner} />Enviando...</>
                ) : 'Enviar link de recuperação'}
              </button>
            </form>

            <p style={styles.footerText}>
              Lembrou a senha?{' '}
              <Link to="/login" style={styles.linkHighlight}>
                Voltar para o login
              </Link>
            </p>
          </>
        )}
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
    top: '10%',
    left: '-15%',
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
  successBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '1.5rem',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--success-bg)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
  },
  successIconWrap: { marginBottom: '1rem' },
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
