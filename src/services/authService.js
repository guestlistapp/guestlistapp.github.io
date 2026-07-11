import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from './firebase';

/**
 * Cadastra um novo usuário com e-mail e senha.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<UserCredential>}
 */
export const registerUser = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

/**
 * Autentica um usuário existente com e-mail e senha.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<UserCredential>}
 */
export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

/**
 * Encerra a sessão do usuário atual.
 * @returns {Promise<void>}
 */
export const logoutUser = () => {
  return signOut(auth);
};

/**
 * Envia um e-mail de redefinição de senha.
 * @param {string} email
 * @returns {Promise<void>}
 */
export const resetPassword = (email) => {
  return sendPasswordResetEmail(auth, email);
};

/**
 * Observa mudanças no estado de autenticação.
 * @param {function} callback - Função chamada com o usuário atual (ou null).
 * @returns {function} Unsubscribe function
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
