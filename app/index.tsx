import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Pressable, Dimensions, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Orientation } from 'expo-screen-orientation';

const DEFAULT_TIME = 6 * 60; // 6 minutes in seconds
const PREPARE_TIME = 5; // 5 seconds for prepare
const REST_TIME = 60; // 1 minute rest
const HELL_ROUNDS_TIME = 2 * 60; // 2 minutes for hell rounds

const GREEN_COLOR = '#009739';
const TIMER_COLOR = '#FFD700'; // Original color for the time readout

export default function Index() {
  const { height, width } = Dimensions.get('window');
  const [time, setTime] = useState(PREPARE_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [orientation, setOrientation] = useState<Orientation | 'LANDSCAPE' | 'PORTRAIT'>(ScreenOrientation.Orientation.PORTRAIT_UP);
  const [modalVisible, setModalVisible] = useState(false);
  const [mode, setMode] = useState<'preparar' | 'roll' | 'hellRounds' | 'stopwatch'>('preparar');
  const [headerText, setHeaderText] = useState('Preparar...');
  const [fontSize, setFontSize] = useState(80);

  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
    };
    lockOrientation();

    const subscription = ScreenOrientation.addOrientationChangeListener(({ orientationInfo }) => {
      const newOrientation =
        orientationInfo.orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
        orientationInfo.orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
          ? 'LANDSCAPE'
          : 'PORTRAIT';
      setOrientation(newOrientation);
    });

    return () => {
      ScreenOrientation.removeOrientationChangeListener(subscription);
    };
  }, []);

  useEffect(() => {
    if (orientation === 'LANDSCAPE') {
      setFontSize(height * 0.75);
      console.log('Orientation effect triggered. Orientation:', orientation, 'Width:', width, 'Font size set to:', width * 0.2);
    } else {
      setFontSize(80);
      console.log('Orientation effect triggered. Orientation:', orientation, 'Height:', height, 'Font size set to: 80');
    }
  }, [orientation, width, height]);

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setTime((prevTime) => {
          if (mode === 'stopwatch') {
            return prevTime + 1;
          } else {
            if (prevTime > 0) {
              return prevTime - 1;
            } else {
              clearInterval(interval);
              handleTimerEnd();
              return 0;
            }
          }
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRunning, time, mode]);

  const handlePlayPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    switch (mode) {
      case 'preparar':
        setTime(PREPARE_TIME);
        setHeaderText('Preparar...');
        break;
      case 'roll':
        setTime(DEFAULT_TIME);
        setHeaderText('Combat');
        break;
      case 'hellRounds':
        setTime(HELL_ROUNDS_TIME);
        setHeaderText('SUFFER');
        break;
      case 'stopwatch':
        setTime(0);
        setHeaderText('Stopwatch');
        break;
      default:
        setTime(PREPARE_TIME);
        setHeaderText('Preparar...');
    }
  };

  const handleTimerEnd = () => {
    if (mode === 'preparar') {
      setTime(DEFAULT_TIME);
      setHeaderText('Combat');
      setMode('roll');
      setIsRunning(true); // Ensure the timer starts running for roll mode
    } else if (mode === 'roll') {
      setTime(REST_TIME);
      setHeaderText('Rest');
    } else if (mode === 'hellRounds') {
      setTime(HELL_ROUNDS_TIME);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedMinutes = mode === 'stopwatch' ? minutes.toString().padStart(2, '0') : minutes.toString();
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  const startRollMode = () => {
    setMode('preparar');
    setTime(PREPARE_TIME);
    setHeaderText('Preparar...');
    setModalVisible(false);
    setIsRunning(false);
  };

  const startHellRoundsMode = () => {
    setMode('hellRounds');
    setTime(PREPARE_TIME);
    setHeaderText('Preparar...');
    setModalVisible(false);
    setIsRunning(false);
  };

  const startStopwatchMode = () => {
    setMode('stopwatch');
    setTime(0);
    setHeaderText('Stopwatch');
    setModalVisible(false);
    setIsRunning(false);
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handleReset} style={[styles.iconButton, styles.topLeft]}>
        <MaterialIcons name="refresh" size={40} color={GREEN_COLOR} />
      </Pressable>
      <Pressable onPress={handlePlayPause} style={[styles.iconButton, styles.topRight]}>
        <MaterialIcons name={isRunning ? "pause" : "play-arrow"} size={40} color={GREEN_COLOR} />
      </Pressable>
      <Pressable onPress={() => setModalVisible(true)} style={[styles.iconButton, styles.bottomLeft]}>
        <MaterialIcons name="settings" size={40} color={GREEN_COLOR} />
      </Pressable>
      <View style={styles.timerContainer}>
        <Text style={styles.headerText}>{headerText}</Text>
        <Text style={[styles.timerText, { fontSize }]}>{formatTime(time)}</Text>
      </View>
      <Text style={styles.modeText}>{mode}</Text>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Pressable onPress={startRollMode} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Roll</Text>
            </Pressable>
            <Pressable onPress={startHellRoundsMode} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Hell Rounds</Text>
            </Pressable>
            <Pressable onPress={startStopwatchMode} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Stopwatch</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C2C2C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    color: TIMER_COLOR,
    fontFamily: 'Roboto',
  },
  headerText: {
    color: GREEN_COLOR,
    fontSize: 24,
    fontFamily: 'Roboto',
    marginBottom: 10,
  },
  modeText: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    color: GREEN_COLOR,
    fontSize: 18,
    fontFamily: 'Roboto',
    padding: 20,
    textTransform: 'uppercase'
  },
  iconButton: {
    position: 'absolute',
    padding: 20,
    zIndex: 10,
  },
  topLeft: {
    top: 20,
    left: 20,
  },
  topRight: {
    top: 20,
    right: 20,
  },
  bottomLeft: {
    bottom: 20,
    left: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButton: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: GREEN_COLOR,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});
