import { StatusBar } from 'expo-status-bar';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useMood } from '@/contexts/MoodContext';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './history.styles';

export default function HistoryScreen() {
  const { moodHistory, clearHistory } = useMood();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Grouper les humeurs par date
  const groupedMoods = moodHistory.reduce((acc, entry) => {
    const date = entry.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, typeof moodHistory>);

  // Formater la date en français
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateString === today.toISOString().split('T')[0]) {
      return "Aujourd'hui";
    } else if (dateString === yesterday.toISOString().split('T')[0]) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  // Formater l'heure
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculer les statistiques
  const getMoodStats = () => {
    if (moodHistory.length === 0) return null;

    const moodData: Record<string, { count: number; emoji: string }> = {};

    moodHistory.forEach((entry) => {
      if (!moodData[entry.moodLabel]) {
        moodData[entry.moodLabel] = { count: 0, emoji: entry.moodEmoji };
      }
      moodData[entry.moodLabel].count += 1;
    });

    const mostFrequent = Object.entries(moodData).sort((a, b) => b[1].count - a[1].count)[0];

    return {
      total: moodHistory.length,
      mostFrequentEmoji: mostFrequent ? mostFrequent[1].emoji : null,
      mostFrequentLabel: mostFrequent ? mostFrequent[0] : null,
      mostFrequentCount: mostFrequent ? mostFrequent[1].count : 0,
    };
  };

  const stats = getMoodStats();

  const handleClearHistory = async () => {
    await clearHistory();
    setShowClearConfirm(false);
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar style="light" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📊 Historique</Text>
          <Text style={styles.subtitle}>Retracez votre parcours émotionnel</Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Statistiques */}
          {stats && (
            <View style={styles.statsSection}>
              <Text style={styles.statsTitle}>📊 Statistiques</Text>
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.total}</Text>
                  <Text style={styles.statLabel}>Entrées totales</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValueEmoji}>{stats.mostFrequentEmoji}</Text>
                  <Text style={styles.statLabel}>Humeur fréquente</Text>
                  <Text style={styles.statSubLabel}>({stats.mostFrequentCount}x)</Text>
                </View>
              </View>
            </View>
          )}

          {/* Historique récent */}
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>📝 Historique récent</Text>

            {Object.keys(groupedMoods).length > 0 ? (
              <>
                {Object.keys(groupedMoods)
                  .sort((a, b) => b.localeCompare(a))
                  .slice(0, 10)
                  .map((date) => (
                    <View key={date}>
                      {groupedMoods[date].map((entry) => (
                        <View key={entry.id} style={styles.historyItem}>
                          <Text style={styles.historyDate}>
                            {formatDate(date)} à {formatTime(entry.timestamp)}
                          </Text>
                          <Text style={styles.historyMood}>
                            {entry.moodEmoji} {entry.moodLabel}
                          </Text>
                          {entry.note && (
                            <Text style={styles.historyComment}>"{entry.note}"</Text>
                          )}
                        </View>
                      ))}
                    </View>
                  ))}

                {/* Bouton pour effacer l'historique */}
                <View style={styles.clearSection}>
                  {!showClearConfirm ? (
                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={() => setShowClearConfirm(true)}
                    >
                      <Text style={styles.clearButtonText}>Effacer l'historique</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.confirmContainer}>
                      <Text style={styles.confirmText}>Êtes-vous sûr ?</Text>
                      <View style={styles.confirmButtons}>
                        <TouchableOpacity
                          style={styles.cancelButton}
                          onPress={() => setShowClearConfirm(false)}
                        >
                          <Text style={styles.cancelButtonText}>Annuler</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={handleClearHistory}
                        >
                          <Text style={styles.deleteButtonText}>Effacer</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              </>
            ) : (
              <Text style={styles.emptyText}>Aucune entrée pour le moment</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
