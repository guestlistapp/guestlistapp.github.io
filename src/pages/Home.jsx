import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllEvents, createEvent, deleteEvent } from '../services/eventService';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllEvents();
      setEvents(data);
    } catch (err) {
      console.error(err);
      setError("Não foi possível carregar os eventos. Verifique suas regras de segurança ou conexão com o Firebase.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    // Redirect to event edit page with 'novo' ID to create a draft in memory
    navigate(`/admin/evento/novo/editar`);
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Tem certeza que deseja excluir este evento e todas as suas informações?')) {
      try {
        await deleteEvent(eventId);
        await loadEvents();
      } catch (err) {
        console.error(err);
        alert("Erro ao excluir evento. Verifique sua conexão ou permissões.");
      }
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 500 }}>Carregando seus eventos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: '1.5rem' }}>
        <div style={{ color: 'var(--danger)', fontSize: '1.2rem', fontWeight: 500, textAlign: 'center', maxWidth: '500px' }}>{error}</div>
        <button className="btn-primary" onClick={loadEvents}>Tentar Novamente</button>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Meus Eventos</h1>
          <p className="page-subtitle">Gerencie todas as suas listas de convidados de forma centralizada e profissional.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {user?.email}
          </span>
          <button
            id="home-logout"
            onClick={handleLogout}
            title="Sair da conta"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.5rem 0.875rem', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)', color: 'var(--text-muted)',
              fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer',
              background: 'transparent', transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.color = 'var(--danger)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sair
          </button>
          <button className="btn-primary" onClick={handleCreateEvent}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Criar Novo Evento
          </button>
        </div>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '2rem' }}>
        {events.length === 0 && (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Nenhum evento encontrado</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Crie o seu primeiro evento e comece a convidar as pessoas!</p>
            <button className="btn-primary" onClick={handleCreateEvent}>Criar Primeiro Evento</button>
          </div>
        )}
        
        {events.map(evt => (
          <div key={evt.id} className="card" style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', padding: 0 }}>
            {/* Imagem de Capa do Evento (se houver, senão cor de fundo) */}
            <div style={{ 
              height: '140px', 
              background: evt.theme?.image ? `url(${evt.theme.image}) center/cover no-repeat` : (evt.theme?.color || 'linear-gradient(135deg, var(--primary) 0%, #334155 100%)'),
              borderBottom: '1px solid var(--border-color)'
            }}></div>
            
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h2 className="card-title">{evt.title || 'Evento sem Nome'}</h2>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  {evt.date ? new Date(evt.date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Data indefinida'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{evt.location || 'Local a definir'}</span>
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to={`/admin/evento/${evt.id}`} className="btn-outline" style={{ flex: 1, textDecoration: 'none' }}>
                  Acessar Painel
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </Link>
                <button 
                  onClick={() => handleDeleteEvent(evt.id)} 
                  className="btn-outline" 
                  style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '0 1rem' }}
                  title="Excluir Evento"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
