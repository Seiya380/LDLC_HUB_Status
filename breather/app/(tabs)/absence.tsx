import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useAbsence } from '@/contexts/AbsenceContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { styles } from './absence.styles';

export default function AbsenceScreen() {
  const { saveAbsence, getTodayAbsence, deleteAbsence, absenceHistory } = useAbsence();
  const [isAbsent, setIsAbsent] = useState(false);
  const [justification, setJustification] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const todayAbsence = getTodayAbsence();

  // Charger l'absence du jour si elle existe
  useEffect(() => {
    if (todayAbsence) {
      setIsAbsent(true);
      setJustification(todayAbsence.justification);
      setImageUri(todayAbsence.imageUri);
    }
  }, []);

  // Fonction pour sélectionner une image depuis la galerie
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission refusée', 'Vous devez autoriser l\'accès à la galerie pour ajouter une image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Fonction pour prendre une photo avec la caméra
  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission refusée', 'Vous devez autoriser l\'accès à la caméra pour prendre une photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Supprimer l'image sélectionnée
  const removeImage = () => {
    setImageUri(undefined);
  };

  const handleSubmit = async () => {
    if (!isAbsent) {
      Alert.alert('Erreur', 'Veuillez cocher la case pour vous déclarer absent');
      return;
    }

    if (!justification.trim()) {
      Alert.alert('Erreur', 'Veuillez fournir une justification');
      return;
    }

    await saveAbsence(justification, imageUri);
    Alert.alert('✓', 'Absence enregistrée avec succès !');

    // Réinitialiser
    setIsAbsent(false);
    setJustification('');
    setImageUri(undefined);
  };

  // Formater la date en français
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
          <Text style={styles.title}>📅 Absence</Text>
          <Text style={styles.subtitle}>Déclarez votre absence du jour</Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Status du jour */}
          {todayAbsence ? (
            <View style={styles.statusBanner}>
              <Text style={styles.statusText}>✓ Vous êtes déclaré(e) absent(e) aujourd'hui</Text>
            </View>
          ) : (
            <View style={[styles.statusBanner, styles.statusBannerPresent]}>
              <Text style={styles.statusTextPresent}>Vous êtes présent(e) aujourd'hui</Text>
            </View>
          )}

          {/* Checkbox Section */}
          <View style={styles.checkboxSection}>
            <Text style={styles.sectionTitle}>Statut d'absence</Text>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setIsAbsent(!isAbsent)}
            >
              <View style={[styles.checkbox, isAbsent && styles.checkboxChecked]}>
                {isAbsent && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Je suis absent(e) aujourd'hui</Text>
            </TouchableOpacity>
          </View>

          {/* Justification Section */}
          {isAbsent && (
            <>
              <View style={styles.justificationSection}>
                <Text style={styles.justificationLabel}>
                  Justification <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.justificationInput}
                  placeholder="Expliquez la raison de votre absence..."
                  placeholderTextColor="#999"
                  value={justification}
                  onChangeText={setJustification}
                  multiline
                  numberOfLines={4}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    Keyboard.dismiss();
                    if (isAbsent && justification.trim()) {
                      handleSubmit();
                    }
                  }}
                />
              </View>

              {/* Image Section */}
              <View style={styles.imageSection}>
                <Text style={styles.imageLabel}>Ajouter un justificatif (optionnel)</Text>

                {imageUri ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                    <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                      <Text style={styles.removeImageText}>✕ Supprimer</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.imageButtonsContainer}>
                    <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                      <Text style={styles.imageButtonIcon}>📁</Text>
                      <Text style={styles.imageButtonText}>Galerie</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                      <Text style={styles.imageButtonIcon}>📷</Text>
                      <Text style={styles.imageButtonText}>Caméra</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, !isAbsent && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!isAbsent}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.submitGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.submitButtonText}>Enregistrer l'absence</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Historique des absences */}
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>📝 Historique des absences</Text>

            {absenceHistory.length > 0 ? (
              <View style={styles.historyList}>
                {absenceHistory.slice(0, 5).map((entry) => (
                  <View key={entry.id} style={styles.historyItem}>
                    <View style={styles.historyHeader}>
                      <Text style={styles.historyDate}>{formatDate(entry.date)}</Text>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => {
                          Alert.alert(
                            'Supprimer l\'absence',
                            'Êtes-vous sûr de vouloir supprimer cette absence ?',
                            [
                              { text: 'Annuler', style: 'cancel' },
                              {
                                text: 'Supprimer',
                                style: 'destructive',
                                onPress: () => deleteAbsence(entry.id)
                              }
                            ]
                          );
                        }}
                      >
                        <Text style={styles.deleteButtonText}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.historyJustification}>"{entry.justification}"</Text>
                    {entry.imageUri && (
                      <Image source={{ uri: entry.imageUri }} style={styles.historyImage} />
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>Aucune absence enregistrée</Text>
            )}
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
