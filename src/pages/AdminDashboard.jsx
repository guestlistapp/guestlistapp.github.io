import React, { useEffect, useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { getAllGuests, getAllGroups } from '../services/guestService';

export default function AdminDashboard() {
  const { eventData, loading } = useAppData();
  const [guests, setGuests] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);

  const activeCategories = eventData?.settings?.guestCategories?.filter(c => c.enabled) || [];

  useEffect(() => {
    const fetchStats = async () => {
      if (!eventData?.id) return;
      const guestsData = await getAllGuests(eventData.id);
      const groupsData = await getAllGroups(eventData.id);
      setGuests(guestsData);
      setGroups(groupsData);
    };
    fetchStats();
  }, [eventData?.id]);

  if (loading || !eventData) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 500 }}>Carregando dados do painel...</div>
      </div>
    );
  }

  const totalGuests = guests.length;
  
  // Calcula dinamicamente o número de confirmados por categoria
  const confirmedByCat = {};
  let totalConfirmed = 0;
  activeCategories.forEach(cat => {
    const count = guests.filter(g => g.type === cat.id && g.status === 'confirmed').length;
    confirmedByCat[cat.id] = count;
    totalConfirmed += count;
  });

  return (
    <div className="container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Visão Geral</h1>
          <p className="page-subtitle">{eventData.title}</p>
        </div>
      </header>

      {/* Cards de Estatísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div 
          className="card" 
          style={{ 
            cursor: 'pointer', 
            border: activeFilter === 'all' ? '2px solid var(--primary)' : '1px solid var(--border-color)', 
            transform: activeFilter === 'all' ? 'translateY(-2px)' : 'none',
            boxShadow: activeFilter === 'all' ? 'var(--shadow-md)' : 'var(--shadow-sm)'
          }}
          onClick={() => setActiveFilter(activeFilter === 'all' ? null : 'all')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total na Lista</h3>
            <div style={{ padding: '0.5rem', background: 'var(--surface-hover)', borderRadius: '8px', color: 'var(--text-muted)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>{totalGuests}</p>
        </div>
        
        {activeCategories.map(cat => (
          <div 
            key={cat.id}
            className="card" 
            style={{ 
              cursor: 'pointer', 
              border: activeFilter === cat.id ? '2px solid var(--success)' : '1px solid var(--border-color)',
              transform: activeFilter === cat.id ? 'translateY(-2px)' : 'none',
              boxShadow: activeFilter === cat.id ? 'var(--shadow-md)' : 'var(--shadow-sm)'
            }}
            onClick={() => setActiveFilter(activeFilter === cat.id ? null : cat.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cat.label}</h3>
              <div style={{ padding: '0.5rem', background: 'var(--success-bg)', borderRadius: '8px', color: 'var(--success-text)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
            </div>
            <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--success)', lineHeight: 1 }}>{confirmedByCat[cat.id] || 0}</p>
          </div>
        ))}
      </div>

      {/* Progresso Geral */}
      <div className="card" style={{ marginBottom: '3rem' }}>
        <h3 className="card-title" style={{ marginBottom: '1rem' }}>Taxa de Confirmação</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
          <span>{totalConfirmed} confirmados</span>
          <span>{totalGuests > 0 ? Math.round((totalConfirmed / totalGuests) * 100) : 0}%</span>
        </div>
        <div style={{ width: '100%', height: '12px', background: 'var(--surface-hover)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ 
            width: `${totalGuests > 0 ? (totalConfirmed / totalGuests) * 100 : 0}%`, 
            height: '100%', 
            background: 'var(--success)', 
            transition: 'width 1s ease-in-out' 
          }}></div>
        </div>
      </div>

      {/* Modal de Listagem de Convidados */}
      {activeFilter && (
        <div 
          style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', 
            zIndex: 100, padding: '1rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveFilter(null);
          }}
        >
          <div 
            className="card" 
            style={{ 
              width: '100%', maxWidth: '700px', maxHeight: '90vh', 
              overflowY: 'auto', padding: 0, position: 'relative',
              animation: 'fadeInUp 0.3s ease-out'
            }}
          >
            {/* Cabeçalho Fixo do Modal */}
            <div style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
              padding: '1.5rem', borderBottom: '1px solid var(--border-color)', 
              position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 10
            }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 600 }}>
                {activeFilter === 'all' ? 'Toda a Lista de Convidados' : `Lista de Confirmados: ${activeCategories.find(c => c.id === activeFilter)?.label}`}
              </h2>
              <button 
                onClick={() => setActiveFilter(null)}
                style={{ 
                  background: 'var(--surface-hover)', border: 'none', borderRadius: '50%',
                  width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--text-main)', transition: 'background 0.2s'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            {/* Conteúdo da Lista */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {(() => {
                const filteredGroups = groups.map(group => {
                  let filteredGuests = guests.filter(g => g.groupId === group.id);
                  if (activeFilter !== 'all') {
                    filteredGuests = filteredGuests.filter(g => g.status === 'confirmed' && g.type === activeFilter);
                  }
                  return { ...group, filteredGuests };
                }).filter(g => g.filteredGuests.length > 0);

                if (filteredGroups.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 1rem auto', opacity: 0.5 }}>
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line>
                      </svg>
                      <p style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-main)' }}>Nenhum convidado encontrado</p>
                      <p>Ainda não há registros para esta categoria.</p>
                    </div>
                  );
                }

                return filteredGroups.map(group => (
                  <div key={group.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ background: 'var(--surface-hover)', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
                      <h3 style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-main)' }}>{group.name}</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {group.filteredGuests.map((g, index) => {
                        const catName = activeCategories.find(c => c.id === g.type)?.label || g.type;
                        const isLast = index === group.filteredGuests.length - 1;
                        
                        return (
                          <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isLast ? 'none' : '1px solid var(--border-color)', padding: '1rem 1.25rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{g.name}</span>
                              <span className="badge badge-neutral" style={{ alignSelf: 'flex-start' }}>{catName}</span>
                            </div>
                            
                            {g.status === 'confirmed' ? (
                              <span className="badge badge-success">Confirmado</span>
                            ) : g.status === 'declined' ? (
                              <span className="badge badge-danger">Não irá</span>
                            ) : (
                              <span className="badge badge-warning">Pendente</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
