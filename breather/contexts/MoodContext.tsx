import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface MoodEntry {
  id: string;
  moodIndex: number;
  moodLabel: string;
  moodEmoji: string;
  timestamp: number;
  date: string; // Format: YYYY-MM-DD
  note?: string;
}

interface MoodContextType {
  moodHistory: MoodEntry[];
  saveMood: (moodIndex: number, moodLabel: string, moodEmoji: string, note?: string) => Promise<void>;
  getTodayMood: () => MoodEntry | undefined;
  getMoodsByDateRange: (startDate: string, endDate: string) => MoodEntry[];
  clearHistory: () => Promise<void>;
  isLoading: boolean;
}

// Contexte
const MoodContext = createContext<MoodContextType | undefined>(undefined);

// Clé pour AsyncStorage
const STORAGE_KEY = '@breather_mood_history';

// Provider
export function MoodProvider({ children }: { children: ReactNode }) {
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
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
        setMoodHistory(parsed);
      }
    } catch (error) {
      console.error('Error loading mood history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveMood = async (
    moodIndex: number,
    moodLabel: string,
    moodEmoji: string,
    note?: string
  ) => {
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];

      const newEntry: MoodEntry = {
        id: `${now.getTime()}`,
        moodIndex,
        moodLabel,
        moodEmoji,
        timestamp: now.getTime(),
        date: today,
        note,
      };

      // Vérifier si une humeur existe déjà pour aujourd'hui
      const todayMoodIndex = moodHistory.findIndex(entry => entry.date === today);

      let updatedHistory: MoodEntry[];
      if (todayMoodIndex !== -1) {
        // Remplacer l'humeur existante du jour
        updatedHistory = [...moodHistory];
        updatedHistory[todayMoodIndex] = newEntry;
      } else {
        // Ajouter une nouvelle entrée
        updatedHistory = [newEntry, ...moodHistory];
      }

      setMoodHistory(updatedHistory);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving mood:', error);
    }
  };

  const getTodayMood = () => {
    const today = new Date().toISOString().split('T')[0];
    return moodHistory.find((entry) => entry.date === today);
  };

  const getMoodsByDateRange = (startDate: string, endDate: string) => {
    return moodHistory.filter(
      (entry) => entry.date >= startDate && entry.date <= endDate
    );
  };

  const clearHistory = async () => {
    try {
      setMoodHistory([]);
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  return (
    <MoodContext.Provider
      value={{
        moodHistory,
        saveMood,
        getTodayMood,
        getMoodsByDateRange,
        clearHistory,
        isLoading,
      }}
    >
      {children}
    </MoodContext.Provider>
  );
}

// Hook personnalisé
export function useMood() {
  const context = useContext(MoodContext);
  if (context === undefined) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
}
