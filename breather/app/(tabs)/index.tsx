import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useMood } from '@/contexts/MoodContext';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './index.styles';

// Les humeurs disponibles avec gradients
const MOODS = [
  {
    emoji: '🌞',
    label: 'Grand Soleil',
    gradientColors: ['#FFD700', '#FF8C00'] as const, // Or à Orange foncé (très chaud)
    borderColor: '#FFD700'
  },
  {
    emoji: '☀️',
    label: 'Petit soleil',
    gradientColors: ['#FFF44F', '#FFD700'] as const, // Jaune clair à Or (chaud)
    borderColor: '#FFF44F'
  },
  {
    emoji: '😑',
    label: 'Neutre',
    gradientColors: ['#D3D3D3', '#A9A9A9'] as const, // Gris clair à Gris (neutre)
    borderColor: '#D3D3D3'
  },
  {
    emoji: '🤨',
    label: 'Confus',
    gradientColors: ['#B0C4DE', '#778899'] as const, // Bleu clair acier à Gris ardoise (neutre-froid)
    borderColor: '#B0C4DE'
  },
  {
    emoji: '😕',
    label: 'Moyen',
    gradientColors: ['#FFA07A', '#FF7F50'] as const, // Saumon clair à Corail (neutre-chaud)
    borderColor: '#FFA07A'
  },
  {
    emoji: '😴',
    label: 'Fatigue',
    gradientColors: ['#ADD8E6', '#87CEEB'] as const, // Bleu clair à Bleu ciel (froid doux)
    borderColor: '#ADD8E6'
  },
  {
    emoji: '😫',
    label: 'Frustre',
    gradientColors: ['#FF6347', '#DC143C'] as const, // Tomate à Cramoisi (chaud-négatif)
    borderColor: '#FF6347'
  },
  {
    emoji: '⛈️',
    label: 'Orageux',
    gradientColors: ['#4682B4', '#2F4F4F'] as const, // Bleu acier à Gris ardoise foncé (très froid)
    borderColor: '#4682B4'
  },
  {
    emoji: '🤷🏻‍♀️🤷🏻',
    label: 'Je sais pas',
    gradientColors: ['#9370DB', '#8B7D9E'] as const, // Violet moyen à Gris violet (neutre-mystérieux)
    borderColor: '#9370DB'
  },
];

export default function HomeScreen() {
  const { saveMood } = useMood();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [comment, setComment] = useState('');

  // Sélectionner l'humeur (sans sauvegarder immédiatement)
  const handleMoodSelect = (index: number) => {
    setSelectedMood(index);
  };

  // Enregistrer l'humeur avec le commentaire
  const handleSubmit = async () => {
    if (selectedMood === null) return;

    const mood = MOODS[selectedMood];
    await saveMood(selectedMood, mood.label, mood.emoji, comment);

    // Afficher un message de succès
    Alert.alert('✓', 'Humeur enregistrée avec succès !');

    // Réinitialiser
    setSelectedMood(null);
    setComment('');
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar style="light" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🎯 LDLC Hub Stat</Text>
          <Text style={styles.subtitle}>Suivez votre humeur quotidienne</Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Mood Selector */}
          <View style={styles.moodSection}>
            <Text style={styles.sectionTitle}>Comment vous sentez-vous aujourd'hui ?</Text>
            <View style={styles.moodGrid}>
              {MOODS.map((mood, index) => {
                const isSelected = selectedMood === index;
                const isLastButton = index === MOODS.length - 1; // Dernier bouton = "Je sais pas"

                if (isSelected) {
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.moodButton,
                        isLastButton && styles.moodButtonLarge,
                      ]}
                      onPress={() => handleMoodSelect(index)}
                    >
                      <LinearGradient
                        colors={mood.gradientColors}
                        style={styles.moodGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      />
                      <View style={styles.moodContent}>
                        <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                        <Text style={[styles.moodLabel, styles.moodLabelSelected]}>{mood.label}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                } else {
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.moodButton,
                        isLastButton && styles.moodButtonLarge,
                      ]}
                      onPress={() => handleMoodSelect(index)}
                    >
                      <View style={styles.moodContent}>
                        <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                        <Text style={styles.moodLabel}>{mood.label}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                }
              })}
            </View>
          </View>

          {/* Comment Section */}
          <View style={styles.commentSection}>
            <Text style={styles.commentLabel}>Commentaire (optionnel)</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Partagez vos pensées..."
              placeholderTextColor="#999"
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              returnKeyType="done"
              onSubmitEditing={() => {
                Keyboard.dismiss();
                if (selectedMood !== null) {
                  handleSubmit();
                }
              }}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, selectedMood === null && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={selectedMood === null}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.submitGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.submitButtonText}>Enregistrer mon humeur</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
