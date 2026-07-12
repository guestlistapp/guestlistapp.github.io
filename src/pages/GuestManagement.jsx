import React, { useEffect, useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { getAllGroups, getAllGuests, createGroupWithGuests, deleteGroup, updateGroupWithGuests } from '../services/guestService';

export default function GuestManagement() {
  const { eventData, loading } = useAppData();
  const [groups, setGroups] = useState([]);
  const [guests, setGuests] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newMembers, setNewMembers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState(null);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [formError, setFormError] = useState('');

  const activeCategories = eventData?.settings?.guestCategories?.filter(c => c.enabled) || [];

  const fetchData = async () => {
    if (!eventData?.id) return;
    try {
      const groupsData = await getAllGroups(eventData.id);
      const guestsData = await getAllGuests(eventData.id);
      setGroups(groupsData);
      setGuests(guestsData);
    } catch (err) {
      console.error(err);
      alert("Não foi possível carregar a lista de convidados. Verifique sua conexão.");
    }
  };

  useEffect(() => {
    fetchData();
  }, [eventData?.id]);

  const copyLink = (slug) => {
    const url = `${window.location.origin}/rsvp/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleAddMember = () => {
    const defaultType = activeCategories.length > 0 ? activeCategories[0].id : '';
    setNewMembers([...newMembers, { name: '', type: defaultType }]);
  };

  const handleMemberChange = (index, field, value) => {
    const updated = [...newMembers];
    updated[index][field] = value;
    setNewMembers(updated);
  };

  const handleRemoveMember = (index) => {
    const updated = newMembers.filter((_, i) => i !== index);
    setNewMembers(updated);
  };
  
  const resetForm = () => {
    setIsFormOpen(false);
    setNewGroupName('');
    setNewMembers([]);
    setEditingGroupId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!newGroupName.trim() || newMembers.some(m => !m.name.trim() || !m.type)) {
      setFormError("Por favor, preencha o nome do grupo e selecione a categoria de todos os membros.");
      return;
    }
    setIsSubmitting(true);
    
    try {
      if (editingGroupId) {
        await updateGroupWithGuests(editingGroupId, newGroupName, newMembers);
      } else {
        await createGroupWithGuests(eventData.id, newGroupName, newMembers);
      }
      await fetchData();
      resetForm();
    } catch (err) {
      console.error(err);
      setFormError("Falha ao salvar no Firebase. Verifique suas permissões ou conexão.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (window.confirm("Tem certeza que deseja excluir este convite e todos os seus membros? Esta ação não pode ser desfeita.")) {
      try {
        await deleteGroup(groupId);
        await fetchData();
      } catch (err) {
        console.error(err);
        alert("Erro ao excluir convite. Verifique sua conexão ou permissões.");
      }
    }
  };

  const handleEditGroup = (group) => {
    const groupGuests = guests.filter(g => g.groupId === group.id);
    setEditingGroupId(group.id);
    setNewGroupName(group.name);
    setNewMembers(groupGuests.map(g => ({ id: g.id, name: g.name, type: g.type, status: g.status })));
    setIsFormOpen(true);
    
    // Smooth scroll to top where form is
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 500 }}>Carregando dados...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Convidados</h1>
          <p className="page-subtitle">Gerencie os grupos familiares e links de RSVP</p>
        </div>
        <button 
          className={isFormOpen ? "btn-outline" : "btn-primary"}
          onClick={() => {
            if (!isFormOpen && newMembers.length === 0 && activeCategories.length > 0) {
              setNewMembers([{ name: '', type: activeCategories[0].id }]);
            }
            if (isFormOpen) {
              resetForm();
            } else {
              setIsFormOpen(true);
            }
          }}
        >
          {isFormOpen ? (
            <>Cancelar</>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Novo Convite
            </>
          )}
        </button>
      </header>

      {isFormOpen && (
        <form className="card" onSubmit={handleSubmit} style={{ marginBottom: '2.5rem', animation: 'fadeIn 0.3s ease-out' }}>
          <h2 className="card-title" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            {editingGroupId ? 'Editar Convite' : 'Criar Novo Link de Convite'}
          </h2>

          {formError && (
            <div style={{ background: 'var(--danger)', color: 'white', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', animation: 'fadeIn 0.2s ease-out' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {formError}
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label">Nome da Família / Grupo (para sua organização)</label>
            <input 
              type="text" 
              value={newGroupName} 
              onChange={e => setNewGroupName(e.target.value)} 
              placeholder="Ex: Família Silva" 
              className="form-input"
              required 
            />
          </div>

          <div style={{ background: 'var(--surface-hover)', padding: '1.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Membros do Convite</span>
              <span style={{ color: 'var(--text-muted)' }}>{newMembers.length} adicionado(s)</span>
            </label>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {newMembers.map((member, index) => (
                <div key={index} className="member-card">
                  <div className="member-card-header">
                    <span className="member-card-title">Membro #{index + 1}</span>
                    {newMembers.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => handleRemoveMember(index)} 
                        className="member-remove-btn"
                        title="Remover membro"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    )}
                  </div>
                  
                  <div className="member-card-fields">
                    <div className="member-field-group">
                      <label className="member-field-label">Nome do Convidado</label>
                      <input 
                        type="text" 
                        value={member.name} 
                        onChange={e => handleMemberChange(index, 'name', e.target.value)} 
                        placeholder="Nome do convidado" 
                        className="form-input"
                        required 
                      />
                    </div>
                    
                    <div className="member-field-group">
                      <label className="member-field-label">Tipo de Convidado</label>
                      <select 
                        value={member.type} 
                        onChange={e => handleMemberChange(index, 'type', e.target.value)}
                        className="form-select"
                        required
                      >
                        <option value="" disabled>Selecione...</option>
                        {activeCategories.map(c => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              type="button" 
              onClick={handleAddMember} 
              style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem', marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
              Adicionar mais um membro a este convite
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" className="btn-outline" onClick={resetForm}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : (editingGroupId ? 'Salvar Alterações' : 'Gerar Link de Convite')}
            </button>
          </div>
        </form>
      )}

      {groups.length === 0 && !isFormOpen && (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Nenhum convidado adicionado</h3>
          <p style={{ color: 'var(--text-muted)' }}>Comece a criar os convites para a sua lista de convidados.</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: '1.5rem' }}>
        {groups.map(group => {
          const groupGuests = guests.filter(g => g.groupId === group.id);
          
          const composition = activeCategories.map(cat => {
            const count = groupGuests.filter(g => g.type === cat.id).length;
            if (count === 0) return null;
            return `${count} ${cat.label}`;
          }).filter(Boolean).join(', ');

          const isCopied = copiedSlug === group.slug;

          return (
            <div key={group.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => handleEditGroup(group)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
                  title="Editar Convite"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button 
                  onClick={() => handleDeleteGroup(group.id)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.25rem' }}
                  title="Excluir Convite"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>

              <div style={{ flex: 1, paddingRight: '3rem' }}>
                <h3 style={{ fontWeight: 600, fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>{group.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.4 }}>
                  {groupGuests.length} membros <br/>
                  <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{composition ? `${composition}` : ''}</span>
                </p>
              </div>
              <button 
                className={isCopied ? "btn-primary" : "btn-outline"} 
                onClick={() => copyLink(group.slug)}
                style={{ 
                  width: '100%', 
                  background: isCopied ? 'var(--success)' : '', 
                  borderColor: isCopied ? 'var(--success)' : '',
                  color: isCopied ? 'white' : ''
                }}
              >
                {isCopied ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Link Copiado!
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    Copiar Link para RSVP
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
