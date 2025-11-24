import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';

export default function BreatherScreen() {
  const scale = useSharedValue(1);
  const [instruction, setInstruction] = useState("Inspirer");
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (isRunning) {
      // Lancement de l'animation en boucle infinie
      scale.value = withRepeat(
        withTiming(1.5, {
          duration: 4000,
          easing: Easing.inOut(Easing.ease)
        }),
        -1,
        true
      );

      // Changer le texte en synchro avec l'animation
      const interval = setInterval(() => {
        setInstruction((prev) => prev === "Inspirer" ? "Expirer" : "Inspirer");
      }, 4000);

      return () => clearInterval(interval);
    } else {
      cancelAnimation(scale);
      scale.value = withTiming(1, { duration: 300 });
    }
  }, [isRunning]);

  const animatedCircleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handleStop = () => {
    setIsRunning(false);
    setTimeout(() => {
      router.back();
    }, 300);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.title}>Breather</Text>
        <Text style={styles.subtitle}>Suit le rythme...</Text>
      </View>

      <View style={styles.circleContainer}>
        <Animated.View style={[styles.breathingCircle, animatedCircleStyle]}>
          <Text style={styles.actionText}>{instruction}</Text>
        </Animated.View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleStop}>
        <Text style={styles.buttonText}>Arrêter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161622',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 80,
  },
  header: { alignItems: 'center' },
  title: { fontSize: 36, fontWeight: 'bold', color: '#FFD700', marginBottom: 10 },
  subtitle: { fontSize: 18, color: '#A0A0A0', fontStyle: 'italic' },
  circleContainer: { justifyContent: 'center', alignItems: 'center', height: 300 },
  breathingCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#1E1E2E',
    borderWidth: 2,
    borderColor: '#87CEEB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#87CEEB",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  actionText: { color: '#FFFFFF', fontSize: 24, fontWeight: '500' },
  button: { backgroundColor: '#FF6B6B', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});
