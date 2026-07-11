import React, { useState, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';
import { updateEvent, createEvent } from '../services/eventService';
import { useNavigate } from 'react-router-dom';

const TimeSelect = ({ value, onChange, name }) => {
  const [hours, setHours] = useState(value ? value.split(':')[0] : '12');
  const [minutes, setMinutes] = useState(value ? value.split(':')[1] : '00');

  useEffect(() => {
    if (value) {
      setHours(value.split(':')[0]);
      setMinutes(value.split(':')[1]);
    }
  }, [value]);

  const handleHours = (e) => {
    const h = e.target.value;
    setHours(h);
    onChange({ target: { name, value: `${h}:${minutes}` } });
  };

  const handleMinutes = (e) => {
    const m = e.target.value;
    setMinutes(m);
    onChange({ target: { name, value: `${hours}:${m}` } });
  };

  return (
    <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
      <select className="form-input" style={{ width: '75px', padding: '0.5rem', textAlign: 'center' }} value={hours} onChange={handleHours}>
        {Array.from({ length: 24 }).map((_, i) => {
          const h = String(i).padStart(2, '0');
          return <option key={h} value={h}>{h}</option>;
        })}
      </select>
      <span style={{ fontWeight: 600 }}>:</span>
      <select className="form-input" style={{ width: '75px', padding: '0.5rem', textAlign: 'center' }} value={minutes} onChange={handleMinutes}>
        {Array.from({ length: 12 }).map((_, i) => { // intervals of 5 minutes for better UX
          const m = String(i * 5).padStart(2, '0');
          return <option key={m} value={m}>{m}</option>;
        })}
      </select>
    </div>
  );
};

const DateInput = ({ value, onChange, min, required }) => {
  const formatDateForDisplay = (isoDate) => {
    if (!isoDate) return '';
    const parts = isoDate.split('-');
    if (parts.length !== 3) return isoDate;
    const [y, m, d] = parts;
    return `${d}/${m}/${y}`;
  };

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, minWidth: '130px' }}>
      <input
        type="text"
        value={formatDateForDisplay(value)}
        readOnly
        className="form-input"
        style={{ width: '100%', backgroundColor: 'var(--surface)', cursor: 'pointer', paddingRight: '2.5rem' }}
        placeholder="DD/MM/AAAA"
      />
      <input
        type="date"
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          opacity: 0, cursor: 'pointer'
        }}
        required={required}
      />
      <div style={{ position: 'absolute', right: '10px', pointerEvents: 'none', color: 'var(--text-muted)' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
      </div>
    </div>
  );
};

export default function EventEdit() {
  const { eventData, refreshEventData } = useAppData();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    endDate: '',
    location: '',
    birthdayPerson: '',
    themeColor: '#0F172A',
    themeImage: ''
  });
  const [isDifferentEndDate, setIsDifferentEndDate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [imageError, setImageError] = useState('');

  const formatForInput = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    return (new Date(d - tzoffset)).toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (eventData) {
      const d1 = formatForInput(eventData.date);
      const d2 = formatForInput(eventData.endDate);

      setFormData({
        title: eventData.title || '',
        date: d1,
        endDate: d2,
        location: eventData.location || '',
        birthdayPerson: eventData.birthdayPerson || '',
        themeColor: eventData.theme?.color || '#0F172A',
        themeImage: eventData.theme?.image || ''
      });

      if (d1 && d2 && d1.split('T')[0] !== d2.split('T')[0]) {
        setIsDifferentEndDate(true);
      } else {
        setIsDifferentEndDate(false);
      }
    }
  }, [eventData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageError('');
    if (file) {
      // Como a codificação Base64 aumenta o tamanho do arquivo em cerca de 33%,
      // limitamos a imagem original a 700 KB para que o documento final no Firestore
      // fique bem abaixo do limite absoluto de 1 MB.
      const maxSize = 700 * 1024; // 700 KB
      if (file.size > maxSize) {
        setImageError("A imagem selecionada é muito grande! O limite de tamanho é de 700 KB.");
        e.target.value = ''; // Limpa o input do arquivo
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, themeImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const eventPayload = {
      title: formData.title,
      location: formData.location,
      birthdayPerson: formData.birthdayPerson,
      date: new Date(formData.date).toISOString(),
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      theme: { color: formData.themeColor, image: formData.themeImage }
    };

    if (eventData.id === 'novo') {
      await createEvent(eventPayload);
    } else {
      await updateEvent(eventData.id, eventPayload);
    }

    await refreshEventData();
    setSaving(false);

    // Show Toast and navigate
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      navigate('/');
    }, 1500);
  };


  if (!eventData) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 500 }}>Carregando dados...</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ position: 'relative' }}>

      {/* Toast Notification (Sofisticado) */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: `translateX(-50%) translateY(${showToast ? '0' : '-100px'})`,
        opacity: showToast ? 1 : 0,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        background: 'var(--success-bg)',
        color: 'var(--success-text)',
        padding: '0.875rem 1.5rem',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-float)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        zIndex: 50,
        fontWeight: 500,
        border: '1px solid var(--success)'
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        Dados do evento atualizados com sucesso!
      </div>

      <header className="page-header">
        <div>
          <h1 className="page-title">Gerenciar Evento</h1>
          <p className="page-subtitle">Atualize as informações que aparecerão no convite virtual.</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <form className="card" onSubmit={handleSave}>
          <h3 className="card-title" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>Informações Básicas</h3>

          <div className="form-group">
            <label className="form-label">Tipo do Evento</label>
            <select name="title" value={formData.title} onChange={handleChange} className="form-select" required>
              <option value="" disabled>Selecione...</option>
              <option value="Aniversário">Aniversário</option>
              <option value="Noivado">Noivado</option>
              <option value="Casamento">Casamento</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Nome do Aniversariante / Noivos</label>
            <input type="text" name="birthdayPerson" value={formData.birthdayPerson} onChange={handleChange} className="form-input" placeholder="Ex: João e Maria" required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', background: 'var(--surface-hover)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Data e Hora de Início</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <DateInput
                  value={formData.date?.split('T')[0] || ''}
                  onChange={(newDate) => {
                    const time = formData.date?.split('T')[1] || '12:00';
                    const currentEndDate = formData.endDate?.split('T')[0] || '';

                    if (isDifferentEndDate && newDate > currentEndDate) {
                      setIsDifferentEndDate(false);
                    }

                    setFormData(prev => {
                      const next = { ...prev, date: `${newDate}T${time}` };
                      if (!isDifferentEndDate || newDate > currentEndDate) {
                        const endT = prev.endDate?.split('T')[1] || '12:00';
                        next.endDate = `${newDate}T${endT}`;
                      }
                      return next;
                    });
                  }}
                  required
                />
                <TimeSelect
                  name="date"
                  value={formData.date?.split('T')[1] || '12:00'}
                  onChange={(e) => {
                    const date = formData.date?.split('T')[0] || new Date().toISOString().split('T')[0];
                    setFormData(prev => ({ ...prev, date: `${date}T${e.target.value}` }));
                  }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Hora de Término</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <input
                    type="checkbox"
                    checked={isDifferentEndDate}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsDifferentEndDate(checked);
                      if (!checked) {
                        setFormData(prev => {
                          const startDate = prev.date?.split('T')[0] || new Date().toISOString().split('T')[0];
                          const endTime = prev.endDate?.split('T')[1] || '12:00';
                          return { ...prev, endDate: `${startDate}T${endTime}` };
                        });
                      }
                    }}
                    style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                  />
                  Termina em outro dia
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {isDifferentEndDate && (
                  <DateInput
                    value={formData.endDate?.split('T')[0] || ''}
                    min={formData.date?.split('T')[0] || ''}
                    onChange={(newDate) => {
                      const time = formData.endDate?.split('T')[1] || '12:00';
                      setFormData(prev => ({ ...prev, endDate: `${newDate}T${time}` }));
                    }}
                    required
                  />
                )}
                <TimeSelect
                  name="endDate"
                  value={formData.endDate?.split('T')[1] || '12:00'}
                  onChange={(e) => {
                    const date = formData.endDate?.split('T')[0] || new Date().toISOString().split('T')[0];
                    setFormData(prev => ({ ...prev, endDate: `${date}T${e.target.value}` }));
                  }}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Local / Endereço</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} className="form-input" placeholder="Nome do espaço e endereço completo" required />
          </div>

          <h3 className="card-title" style={{ marginTop: '2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>Identidade Visual</h3>

          <div style={{ padding: '1.5rem', borderRadius: 'var(--radius)', background: 'var(--surface-hover)', border: '1px solid var(--border-color)' }}>
            <div className="form-group">
              <label className="form-label">Cor Principal (Fundo fallback)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input type="color" name="themeColor" value={formData.themeColor} onChange={handleChange} style={{ width: '50px', height: '50px', padding: '0', border: 'none', borderRadius: '8px', cursor: 'pointer', overflow: 'hidden' }} />
                <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{formData.themeColor}</span>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Imagem de Fundo (Capa do Convite)</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="form-input" style={{ background: 'white' }} />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                <strong>Limite de tamanho: 700 KB</strong>.
                <br />
                Dica: Use imagens verticais de boa qualidade para um melhor resultado no celular.
              </p>
              {imageError && (
                <p style={{ fontSize: '0.85rem', color: 'var(--danger)', marginTop: '0.5rem', fontWeight: 500 }}>
                  ⚠️ {imageError}
                </p>
              )}

              {formData.themeImage && (
                <div style={{ marginTop: '1rem', position: 'relative', display: 'inline-block' }}>
                  <div style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                    <img src={formData.themeImage} alt="Fundo Preview" style={{ width: '120px', height: '200px', objectFit: 'cover', display: 'block' }} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, themeImage: '' }))}
                    style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}
                    title="Remover Imagem"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2.5rem' }}>
            <button type="submit" className="btn-primary" disabled={saving} style={{ minWidth: '180px' }}>
              {saving ? (
                <>Salvando...</>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
