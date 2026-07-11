import React, { createContext, useContext, useState, useEffect } from 'react';
import { getEventById, updateEventSettings } from '../services/eventService';

const AppDataContext = createContext();

export const useAppData = () => useContext(AppDataContext);

export const AppDataProvider = ({ eventId, children }) => {
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    if (eventId === 'novo') {
      setEventData({
        id: 'novo',
        title: '',
        date: new Date().toISOString(),
        endDate: null,
        location: '',
        birthdayPerson: '',
        theme: { color: '#0F172A', image: '' },
        settings: { guestCategories: [{ id: 'cat_default', label: 'Adultos', enabled: true }] }
      });
      setLoading(false);
      return;
    }
    try {
      const data = await getEventById(eventId);
      setEventData(data);
    } catch (err) {
      console.error("Erro ao carregar dados do evento:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      loadData();
    }
  }, [eventId]);

  const updateSettings = async (newSettings) => {
    try {
      await updateEventSettings(eventId, newSettings);
      setEventData(prev => ({ ...prev, settings: newSettings }));
    } catch (err) {
      console.error("Erro ao salvar configurações", err);
    }
  };

  return (
    <AppDataContext.Provider value={{ eventData, loading, updateSettings, refreshEventData: loadData }}>
      {children}
    </AppDataContext.Provider>
  );
};
