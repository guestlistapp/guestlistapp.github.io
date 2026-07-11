import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente de rota protegida.
 * - Se o Firebase ainda está verificando a sessão (loading), exibe um spinner.
 * - Se não há usuário logado, redireciona para /login.
 * - Se há usuário, renderiza o conteúdo protegido (<Outlet /> ou children).
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-color)',
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          border: '3px solid var(--border-color)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Suporta tanto <ProtectedRoute><Component/></ProtectedRoute>
  // quanto uso como elemento de Route com rotas aninhadas (Outlet)
  return children ? children : <Outlet />;
}
