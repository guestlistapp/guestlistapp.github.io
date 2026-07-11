import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange, loginUser, registerUser, logoutUser, resetPassword } from '../services/authService';

const AuthContext = createContext(null);

/**
 * Hook customizado para consumir o contexto de autenticação.
 * Deve ser usado dentro de <AuthProvider>.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um <AuthProvider>');
  }
  return context;
};

/**
 * Provider de autenticação. Envolve toda a aplicação e observa
 * o estado de login do Firebase em tempo real.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // loading=true enquanto o Firebase verifica a sessão inicial (evita flash de redirect)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthChange retorna a função unsubscribe — chamada no cleanup
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    return loginUser(email, password);
  };

  const register = async (email, password) => {
    return registerUser(email, password);
  };

  const logout = async () => {
    return logoutUser();
  };

  const forgotPassword = async (email) => {
    return resetPassword(email);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    forgotPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
