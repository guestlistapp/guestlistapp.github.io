import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getGroupDataBySlug, updateGuestStatus } from '../services/guestService';
import { getEventById } from '../services/eventService';

export default function RsvpPage() {
  const { slug } = useParams();
  const [eventData, setEventData] = useState(null);
  const [group, setGroup] = useState(null);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroup = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getGroupDataBySlug(slug);
        if (data) {
          setGroup(data.group);
          setGuests(data.guests);
          const evt = await getEventById(data.group.eventId);
          setEventData(evt);
        } else {
          setGroup(null);
        }
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar as informações do convite. Verifique sua conexão com a internet.");
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
  }, [slug]);

  const handleSetStatus = async (guestId, targetStatus) => {
    const currentGuest = guests.find(g => g.id === guestId);
    const newStatus = currentGuest?.status === targetStatus ? 'pending' : targetStatus;
    const originalGuests = [...guests];
    // Optimistic update
    setGuests(prev => prev.map(g => g.id === guestId ? { ...g, status: newStatus } : g));
    try {
      await updateGuestStatus(guestId, newStatus);
    } catch (err) {
      console.error(err);
      alert("Não foi possível registrar sua resposta. Por favor, tente novamente.");
      // Rollback
      setGuests(originalGuests);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-color)' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 2s linear infinite' }}><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="4.93" x2="19.07" y2="7.76"></line></svg>
          Abrindo Convite...
        </div>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-color)' }}>
        <div className="card" style={{ textAlign: 'center', padding: '3rem', maxWidth: '400px' }}>
          <div style={{ color: 'var(--danger)', fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--danger)' }}>Erro de Conexão</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>Recarregar Página</button>
        </div>
      </div>
    );
  }
  
  if (!group || !eventData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-color)' }}>
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Convite não encontrado</h2>
          <p style={{ color: 'var(--text-muted)' }}>O link que você tentou acessar é inválido ou foi removido.</p>
        </div>
      </div>
    );
  }

  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return `${d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
  };

  const hasImage = !!eventData.theme?.image;
  const bgColor = eventData.theme?.color || '#0F172A';

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: bgColor,
      backgroundImage: hasImage 
        ? `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url(${eventData.theme.image})` 
        : `linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.15) 100%)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      padding: '2rem 1rem 4rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      
      <div style={{ width: '100%', maxWidth: '640px', marginTop: '2rem', animation: 'fadeInUp 0.6s ease-out' }}>
        
        {/* Cabeçalho do Convite */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '2rem',
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '2.5rem 1.5rem',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
        }}>
          <p style={{ textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.9rem', opacity: 0.9, fontWeight: 500, marginBottom: '1rem', color: 'white' }}>
            Você foi convidado para
          </p>
          <h1 style={{ fontSize: '3rem', fontWeight: 700, margin: '0 0 1.5rem 0', fontFamily: 'Outfit, sans-serif', lineHeight: 1.1, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            {eventData.title}{eventData.birthdayPerson ? ` de ${eventData.birthdayPerson}` : ''}
          </h1>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '1.05rem', fontWeight: 500, opacity: 0.95, color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              {formatDateTime(eventData.date)}
            </div>
            {eventData.endDate && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="12 2 12 12 15 15"></polyline><circle cx="12" cy="12" r="10"></circle></svg>
                Até {formatDateTime(eventData.endDate)}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              {eventData.location}
            </div>
          </div>
        </div>

        {/* Card de Confirmação */}
        <div style={{ 
          background: 'var(--surface)', 
          borderRadius: '24px', 
          padding: '2.5rem 1.5rem', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Olá, {group.name}!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
              Por favor, confirme a presença de cada membro abaixo:
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {guests.map((guest, idx) => {
              const catLabel = eventData?.settings?.guestCategories?.find(c => c.id === guest.type)?.label || guest.type;
              const isLast = idx === guests.length - 1;
              
              return (
              <div key={guest.id} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1rem',
                paddingBottom: isLast ? '0' : '1.5rem',
                borderBottom: isLast ? 'none' : '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontWeight: 600, fontSize: '1.2rem', color: 'var(--text-main)' }}>{guest.name}</h3>
                  <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{catLabel}</span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button 
                    onClick={() => handleSetStatus(guest.id, 'confirmed')}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '12px',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      background: guest.status === 'confirmed' ? 'var(--success)' : 'transparent',
                      color: guest.status === 'confirmed' ? 'white' : 'var(--text-main)',
                      border: '2px solid ' + (guest.status === 'confirmed' ? 'var(--success)' : 'var(--border-color)'),
                      transform: guest.status === 'confirmed' ? 'scale(1.02)' : 'scale(1)',
                      boxShadow: guest.status === 'confirmed' ? '0 10px 15px -3px rgba(16, 185, 129, 0.3)' : 'none'
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Confirmar
                  </button>
                  <button 
                    onClick={() => handleSetStatus(guest.id, 'declined')}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '12px',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      background: guest.status === 'declined' ? 'var(--danger)' : 'transparent',
                      color: guest.status === 'declined' ? 'white' : 'var(--text-main)',
                      border: '2px solid ' + (guest.status === 'declined' ? 'var(--danger)' : 'var(--border-color)'),
                      transform: guest.status === 'declined' ? 'scale(1.02)' : 'scale(1)',
                      boxShadow: guest.status === 'declined' ? '0 10px 15px -3px rgba(239, 68, 68, 0.3)' : 'none'
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    Não irá
                  </button>
                </div>
              </div>
            )})}
          </div>
        </div>

        {/* Rodapé com convite para criar evento */}
        <footer style={{ 
          marginTop: '2.5rem', 
          textAlign: 'center' 
        }}>
          <a
            href="https://guestlistapp.github.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="rsvp-create-event-link"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.25rem',
              borderRadius: '9999px',
              background: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.25s ease',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
            }}
          >
            <span>Clique aqui e crie o seu evento</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </footer>
      </div>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .rsvp-create-event-link:hover {
          background: rgba(255, 255, 255, 0.25) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3) !important;
          color: #ffffff !important;
        }
      `}</style>
    </div>
  );
}
