import { db, auth } from './firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';

const DEFAULT_CATEGORIES = [
  { id: 'adult', label: 'Adultos', enabled: true },
  { id: 'teen', label: 'Adolescentes', enabled: true },
  { id: 'child', label: 'Crianças (< 5 anos)', enabled: true },
  { id: 'child_older', label: 'Crianças (> 5 anos)', enabled: true },
];

/**
 * Retorna o UID do usuário atualmente autenticado.
 * Lança um erro descritivo se não houver usuário logado.
 */
const getCurrentUserId = () => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Nenhum usuário autenticado.');
  return uid;
};

/**
 * Retorna todos os eventos do usuário autenticado.
 */
export const getAllEvents = async () => {
  const uid = getCurrentUserId();
  const q = query(collection(db, 'gl_events'), where('userId', '==', uid));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/**
 * Retorna um evento pelo ID.
 * A validação de propriedade fica por conta das Firestore Security Rules.
 */
export const getEventById = async (eventId) => {
  const snap = await getDoc(doc(db, 'gl_events', eventId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

/**
 * Cria um novo evento vinculando-o ao usuário autenticado via userId.
 */
export const createEvent = async (eventData) => {
  const uid = getCurrentUserId();
  const newEvent = {
    ...eventData,
    userId: uid, // campo de isolamento de dados
    settings: { guestCategories: [...DEFAULT_CATEGORIES] },
  };

  const eventRef = doc(collection(db, 'gl_events'));
  const finalEvent = { ...newEvent, id: eventRef.id };
  await setDoc(eventRef, finalEvent);
  return finalEvent;
};

export const updateEvent = async (eventId, eventData) => {
  const ref = doc(db, 'gl_events', eventId);
  await updateDoc(ref, eventData);
};

export const updateEventSettings = async (eventId, newSettings) => {
  return updateEvent(eventId, { settings: newSettings });
};

export const deleteEvent = async (eventId) => {
  await deleteDoc(doc(db, 'gl_events', eventId));
};
