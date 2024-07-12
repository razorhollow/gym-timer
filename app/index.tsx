import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';

const DEFAULT_TIME = 6 * 60; // 6 minutes in seconds

export default function Index() {
  const [time, setTime] = useState(DEFAULT_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [orientation, setOrientation] = useState('PORTRAIT');

  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
    };
    lockOrientation();

    const subscription = ScreenOrientation.addOrientationChangeListener(({ orientationInfo }) => {
      setOrientation(
        orientationInfo.orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
        orientationInfo.orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
          ? 'LANDSCAPE'
          : 'PORTRAIT'
      );
    });

    return () => {
      ScreenOrientation.removeOrientationChangeListener(subscription);
    };
  }, []);

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime > 0) {
            return prevTime - 1;
          } else {
            clearInterval(interval);
            setIsRunning(false);
            return DEFAULT_TIME;
          }
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRunning]);

  const handlePlayPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setTime(DEFAULT_TIME);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const { height, width } = Dimensions.get('window');
  const fontSize = orientation === 'LANDSCAPE' ? 320 : 80;

  return (
    <View style={styles.container}>
      <Pressable onPress={handleReset} style={[styles.iconButton, styles.topLeft]}>
        <MaterialIcons name="refresh" size={40} color="#FFD700" />
      </Pressable>
      <Pressable onPress={handlePlayPause} style={[styles.iconButton, styles.topRight]}>
        <MaterialIcons name={isRunning ? "pause" : "play-arrow"} size={40} color="#FFD700" />
      </Pressable>
      <View style={styles.timerContainer}>
        <Text style={[styles.timerText, { fontSize }]}>{formatTime(time)}</Text>
      </View>
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
    color: '#FFD700',
    fontFamily: 'Roboto',
  },
  iconButton: {
    position: 'absolute',
    padding: 10,
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
});
