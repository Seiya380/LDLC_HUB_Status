import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';

// Les humeurs disponibles
const MOODS = [
  { emoji: '😊', label: 'Heureux', color: '#4CAF50' },
  { emoji: '😌', label: 'Calme', color: '#87CEEB' },
  { emoji: '😐', label: 'Neutre', color: '#9E9E9E' },
  { emoji: '😔', label: 'Triste', color: '#5C6BC0' },
  { emoji: '😤', label: 'Stressé', color: '#FF7043' },
];

// Citations inspirantes
const QUOTES = [
  { text: "Respire. Tout va bien se passer.", author: "Anonyme" },
  { text: "Le calme est la clé de la sérénité.", author: "Bouddha" },
  { text: "Chaque jour est une nouvelle chance.", author: "Dalaï Lama" },
  { text: "La paix vient de l'intérieur.", author: "Bouddha" },
  { text: "Sois patient avec toi-même.", author: "Anonyme" },
];

export default function HomeScreen() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [savedNotes, setSavedNotes] = useState<string[]>([]);

  // Citation aléatoire (basée sur le jour)
  const todayQuote = QUOTES[new Date().getDate() % QUOTES.length];

  const saveNote = () => {
    if (note.trim()) {
      setSavedNotes([note.trim(), ...savedNotes.slice(0, 4)]); // Garder les 5 dernières
      setNote('');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Bonjour</Text>
          <Text style={styles.subtitle}>Comment te sens-tu aujourd'hui ?</Text>
        </View>

        {/* Mood Tracker */}
        <View style={styles.widget}>
          <Text style={styles.widgetTitle}>Mon humeur</Text>
          <View style={styles.moodContainer}>
            {MOODS.map((mood, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.moodButton,
                  selectedMood === index && {
                    backgroundColor: mood.color + '30',
                    borderColor: mood.color,
                  }
                ]}
                onPress={() => setSelectedMood(index)}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={[
                  styles.moodLabel,
                  selectedMood === index && { color: mood.color }
                ]}>
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Raccourci Breather */}
        <TouchableOpacity style={styles.breatherWidget} onPress={() => router.push('/breather')}>
          <View style={styles.breatherContent}>
            <View style={styles.miniCircle}>
              <Text style={styles.breatheIcon}>🌬️</Text>
            </View>
            <View style={styles.breatherText}>
              <Text style={styles.breatherTitle}>Breather</Text>
              <Text style={styles.breatherSubtitle}>Prends une pause respiration</Text>
            </View>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

        {/* Citation du jour */}
        <View style={styles.quoteWidget}>
          <Text style={styles.quoteIcon}>✨</Text>
          <Text style={styles.quoteText}>"{todayQuote.text}"</Text>
          <Text style={styles.quoteAuthor}>— {todayQuote.author}</Text>
        </View>

        {/* Widget Notes - Laisser son empreinte */}
        <View style={styles.widget}>
          <Text style={styles.widgetTitle}>Laisse ton empreinte</Text>
          <Text style={styles.widgetSubtitle}>Note une pensée positive ou un objectif</Text>

          <View style={styles.noteInputContainer}>
            <TextInput
              style={styles.noteInput}
              placeholder="Écris quelque chose..."
              placeholderTextColor="#666"
              value={note}
              onChangeText={setNote}
              returnKeyType="send"
              onSubmitEditing={saveNote}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[styles.saveButton, !note.trim() && styles.saveButtonDisabled]}
              onPress={saveNote}
              disabled={!note.trim()}
            >
              <Text style={styles.saveButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Notes sauvegardées */}
          {savedNotes.length > 0 && (
            <View style={styles.savedNotes}>
              {savedNotes.map((savedNote, index) => (
                <View key={index} style={styles.savedNoteItem}>
                  <Text style={styles.noteEmoji}>🌱</Text>
                  <Text style={styles.savedNoteText}>{savedNote}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Espace en bas */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161622',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 30,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0A0A0',
  },

  // Widget générique
  widget: {
    backgroundColor: '#1E1E2E',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  widgetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  widgetSubtitle: {
    fontSize: 14,
    color: '#A0A0A0',
    marginBottom: 15,
  },

  // Mood Tracker
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  moodButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 60,
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: 5,
  },
  moodLabel: {
    fontSize: 11,
    color: '#A0A0A0',
  },

  // Breather Widget
  breatherWidget: {
    backgroundColor: '#1E1E2E',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#87CEEB40',
  },
  breatherContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#87CEEB20',
    borderWidth: 2,
    borderColor: '#87CEEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  breatheIcon: {
    fontSize: 24,
  },
  breatherText: {
    flex: 1,
  },
  breatherTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#87CEEB',
  },
  breatherSubtitle: {
    fontSize: 14,
    color: '#A0A0A0',
    marginTop: 2,
  },
  arrow: {
    fontSize: 24,
    color: '#87CEEB',
  },

  // Quote Widget
  quoteWidget: {
    backgroundColor: '#2A2A3E',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  quoteIcon: {
    fontSize: 24,
    marginBottom: 10,
  },
  quoteText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 10,
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#FFD700',
  },

  // Notes Widget
  noteInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  noteInput: {
    flex: 1,
    backgroundColor: '#161622',
    borderRadius: 15,
    padding: 15,
    color: '#FFFFFF',
    fontSize: 14,
    minHeight: 50,
    maxHeight: 100,
  },
  saveButton: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#87CEEB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#87CEEB50',
  },
  saveButtonText: {
    fontSize: 24,
    color: '#161622',
    fontWeight: 'bold',
  },
  savedNotes: {
    marginTop: 15,
  },
  savedNoteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161622',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  noteEmoji: {
    fontSize: 16,
    marginRight: 10,
  },
  savedNoteText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
});
