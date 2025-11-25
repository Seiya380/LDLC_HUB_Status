import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface AbsenceEntry {
  id: string;
  date: string; // Format: YYYY-MM-DD
  timestamp: number;
  justification: string;
  imageUri?: string; // URI de l'image (optionnel)
}

interface AbsenceContextType {
  absenceHistory: AbsenceEntry[];
  saveAbsence: (justification: string, imageUri?: string) => Promise<void>;
  getTodayAbsence: () => AbsenceEntry | undefined;
  deleteAbsence: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  isLoading: boolean;
}

// Contexte
const AbsenceContext = createContext<AbsenceContextType | undefined>(undefined);

// Clé pour AsyncStorage
const STORAGE_KEY = '@breather_absence_history';

// Provider
export function AbsenceProvider({ children }: { children: ReactNode }) {
  const [absenceHistory, setAbsenceHistory] = useState<AbsenceEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger l'historique au démarrage
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setAbsenceHistory(parsed);
      }
    } catch (error) {
      console.error('Error loading absence history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAbsence = async (justification: string, imageUri?: string) => {
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];

      const newEntry: AbsenceEntry = {
        id: `${now.getTime()}`,
        date: today,
        timestamp: now.getTime(),
        justification: justification.trim(),
        imageUri: imageUri,
      };

      // Vérifier si une absence existe déjà pour aujourd'hui
      const todayAbsenceIndex = absenceHistory.findIndex(entry => entry.date === today);

      let updatedHistory: AbsenceEntry[];
      if (todayAbsenceIndex !== -1) {
        // Remplacer l'absence existante du jour
        updatedHistory = [...absenceHistory];
        updatedHistory[todayAbsenceIndex] = newEntry;
      } else {
        // Ajouter une nouvelle entrée
        updatedHistory = [newEntry, ...absenceHistory];
      }

      setAbsenceHistory(updatedHistory);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving absence:', error);
    }
  };

  const getTodayAbsence = () => {
    const today = new Date().toISOString().split('T')[0];
    return absenceHistory.find((entry) => entry.date === today);
  };

  const deleteAbsence = async (id: string) => {
    try {
      const updatedHistory = absenceHistory.filter((entry) => entry.id !== id);
      setAbsenceHistory(updatedHistory);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error deleting absence:', error);
    }
  };

  const clearHistory = async () => {
    try {
      setAbsenceHistory([]);
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  return (
    <AbsenceContext.Provider
      value={{
        absenceHistory,
        saveAbsence,
        getTodayAbsence,
        deleteAbsence,
        clearHistory,
        isLoading,
      }}
    >
      {children}
    </AbsenceContext.Provider>
  );
}

// Hook personnalisé
export function useAbsence() {
  const context = useContext(AbsenceContext);
  if (context === undefined) {
    throw new Error('useAbsence must be used within an AbsenceProvider');
  }
  return context;
}
