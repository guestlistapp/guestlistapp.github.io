import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FIREBASE_ERRORS = {
  'auth/user-not-found': 'Nenhuma conta encontrada com este e-mail.',
  'auth/wrong-password': 'Senha incorreta. Verifique e tente novamente.',
  'auth/invalid-email': 'E-mail inválido. Verifique o formato.',
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.',
  'auth/user-disabled': 'Esta conta foi desativada.',
};

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Se já estiver logado, redirecionar
  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(FIREBASE_ERRORS[err.code] || 'Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.fullPage}>
        <div style={styles.spinner} />
      </div>
    );
  }

  return (
    <div style={styles.fullPage}>
      {/* Fundo decorativo */}
      <div style={styles.bgDecor} aria-hidden="true" />

      <div style={styles.card}>
        {/* Logo / Ícone */}
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
        </div>

        <h1 style={styles.title}>Bem-vindo(a) ao Guest List</h1>
        <p style={styles.subtitle}>Acesse seus eventos e listas de convidados</p>

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
            <label htmlFor="login-email" className="form-label">E-mail</label>
            <input
              id="login-email"
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

          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
            <label htmlFor="login-password" className="form-label">Senha</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={submitting}
                style={{ paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={styles.eyeBtn}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                tabIndex={-1}
              >
                {showPassword
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                }
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
            <Link to="/recuperar-senha" style={styles.forgotLink}>
              Esqueceu a senha?
            </Link>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '0.875rem', fontSize: '1rem' }}
            disabled={submitting}
            id="login-submit"
          >
            {submitting ? (
              <>
                <span style={styles.btnSpinner} />
                Entrando...
              </>
            ) : 'Entrar'}
          </button>
        </form>

        <p style={styles.footerText}>
          Não tem uma conta?{' '}
          <Link to="/cadastro" style={styles.linkHighlight}>
            Cadastre-se grátis
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
    top: '-20%',
    right: '-10%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(15,23,42,0.06) 0%, transparent 70%)',
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
  logoWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  },
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
  title: {
    textAlign: 'center',
    fontSize: '1.75rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
  },
  subtitle: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.95rem',
    marginBottom: '2rem',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--danger-bg)',
    color: 'var(--danger-text)',
    fontSize: '0.875rem',
    marginBottom: '1.5rem',
    border: '1px solid rgba(239, 68, 68, 0.2)',
  },
  eyeBtn: {
    position: 'absolute',
    right: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  forgotLink: {
    color: 'var(--text-muted)',
    fontSize: '0.875rem',
    fontWeight: 500,
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
  },
  footerText: {
    textAlign: 'center',
    marginTop: '1.75rem',
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
  },
  linkHighlight: {
    color: 'var(--primary)',
    fontWeight: 600,
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid var(--border-color)',
    borderTopColor: 'var(--primary)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  btnSpinner: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.4)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};
