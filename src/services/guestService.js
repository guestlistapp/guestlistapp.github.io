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

/**
 * Retorna o UID do usuário atualmente autenticado.
 */
const getCurrentUserId = () => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Nenhum usuário autenticado.');
  return uid;
};

export const getAllGroups = async (eventId) => {
  const q = query(collection(db, 'gl_groups'), where('eventId', '==', eventId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getAllGuests = async (eventId) => {
  const q = query(collection(db, 'gl_guests'), where('eventId', '==', eventId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getGroupDataBySlug = async (slug) => {
  const qGroup = query(collection(db, 'gl_groups'), where('slug', '==', slug));
  const snapGroup = await getDocs(qGroup);
  if (snapGroup.empty) return null;

  const groupData = { id: snapGroup.docs[0].id, ...snapGroup.docs[0].data() };

  const qGuests = query(collection(db, 'gl_guests'), where('groupId', '==', groupData.id));
  const snapGuests = await getDocs(qGuests);
  const guestsData = snapGuests.docs.map(d => ({ id: d.id, ...d.data() }));

  return { group: groupData, guests: guestsData };
};

export const updateGuestStatus = async (guestId, newStatus) => {
  const ref = doc(db, 'gl_guests', guestId);
  await updateDoc(ref, { status: newStatus });
  return { id: guestId, status: newStatus };
};

/**
 * Cria um grupo com seus convidados, vinculando ambos ao usuário autenticado via userId.
 */
export const createGroupWithGuests = async (eventId, groupName, guestsList) => {
  const uid = getCurrentUserId();

  const generateGuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const groupRef = doc(collection(db, 'gl_groups'));
  const groupId = groupRef.id;
  const slug = generateGuid();
  // userId adicionado ao grupo para isolamento nas Security Rules
  const newGroup = { id: groupId, eventId, userId: uid, name: groupName, slug };

  await setDoc(groupRef, newGroup);

  const promises = guestsList.map((g) => {
    const guestRef = doc(collection(db, 'gl_guests'));
    return setDoc(guestRef, {
      id: guestRef.id,
      eventId,
      groupId: groupId,
      userId: uid, // userId adicionado ao convidado para isolamento
      name: g.name,
      type: g.type,
      status: 'pending',
    });
  });

  await Promise.all(promises);
  return newGroup;
};

export const deleteGroup = async (groupId) => {
  const groupRef = doc(db, 'gl_groups', groupId);
  await deleteDoc(groupRef);

  // Cascade delete nos convidados do grupo
  const q = query(collection(db, 'gl_guests'), where('groupId', '==', groupId));
  const snap = await getDocs(q);
  const deletePromises = snap.docs.map(d => deleteDoc(doc(db, 'gl_guests', d.id)));
  await Promise.all(deletePromises);
};

export const updateGroupWithGuests = async (groupId, groupName, guestsList) => {
  // 1. Atualiza o nome do grupo
  const groupRef = doc(db, 'gl_groups', groupId);
  await updateDoc(groupRef, { name: groupName });

  // 2. Busca os convidados atuais do grupo no Firestore
  const q = query(collection(db, 'gl_guests'), where('groupId', '==', groupId));
  const snap = await getDocs(q);
  const currentGuests = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  // Obtém eventId e userId do documento do grupo
  let eventId = '';
  let userId = '';
  const groupSnap = await getDoc(groupRef);
  if (groupSnap.exists()) {
    eventId = groupSnap.data().eventId;
    userId = groupSnap.data().userId || auth.currentUser?.uid || '';
  }

  // 3. Mapeia quem deve ser mantido/atualizado
  const updatedGuestIds = guestsList.map(g => g.id).filter(Boolean);

  // Deleta do Firestore convidados que não vieram na nova lista
  const guestsToDelete = currentGuests.filter(cg => !updatedGuestIds.includes(cg.id));
  const deletePromises = guestsToDelete.map(g => deleteDoc(doc(db, 'gl_guests', g.id)));

  // Atualiza ou cria os convidados enviados
  const savePromises = guestsList.map(g => {
    if (g.id) {
      const guestRef = doc(db, 'gl_guests', g.id);
      return setDoc(guestRef, {
        id: g.id,
        eventId,
        groupId,
        userId, // preserva o userId nos updates
        name: g.name,
        type: g.type,
        status: g.status || 'pending',
      });
    } else {
      const guestRef = doc(collection(db, 'gl_guests'));
      return setDoc(guestRef, {
        id: guestRef.id,
        eventId,
        groupId,
        userId, // userId adicionado nos novos convidados
        name: g.name,
        type: g.type,
        status: g.status || 'pending',
      });
    }
  });

  await Promise.all([...deletePromises, ...savePromises]);
};
