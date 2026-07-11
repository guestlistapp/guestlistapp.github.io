import React, { useState, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';

export default function SettingsPage() {
  const { eventData, updateSettings } = useAppData();
  const [categories, setCategories] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (eventData?.settings?.guestCategories) {
      setCategories(eventData.settings.guestCategories);
    }
  }, [eventData]);

  const handleToggle = (index) => {
    const updated = [...categories];
    updated[index].enabled = !updated[index].enabled;
    setCategories(updated);
  };

  const handleLabelChange = (index, value) => {
    const updated = [...categories];
    updated[index].label = value;
    setCategories(updated);
  };

  const handleAddCategory = () => {
    setCategories([
      ...categories, 
      { id: 'cat_' + Date.now(), label: 'Nova Categoria', enabled: true }
    ]);
  };

  const handleSave = async () => {
    setSaving(true);
    await updateSettings({ ...eventData.settings, guestCategories: categories });
    setSaving(false);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  if (!eventData) return <div className="container">Carregando...</div>;

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
        Configurações salvas com sucesso!
      </div>

      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>Configurações do Evento</h1>
        <p style={{ color: 'var(--text-muted)' }}>Gerencie as categorias de convidados (ex: faixas de idade que pagam ou não pagam o buffet).</p>
      </header>

      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Categorias de Convidados</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {categories.map((cat, index) => (
            <div key={cat.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input 
                type="checkbox" 
                checked={cat.enabled} 
                onChange={() => handleToggle(index)} 
                title={cat.enabled ? "Desativar categoria" : "Ativar categoria"}
                style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
              />
              <input 
                type="text" 
                value={cat.label} 
                onChange={(e) => handleLabelChange(index, e.target.value)} 
                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', opacity: cat.enabled ? 1 : 0.5 }}
                disabled={!cat.enabled}
              />
            </div>
          ))}
        </div>
        
        <button type="button" onClick={handleAddCategory} style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem', marginTop: '1.5rem' }}>
          + Adicionar nova categoria
        </button>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2.5rem' }}>
          <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ minWidth: '200px' }}>
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </div>
    </div>
  );
}
