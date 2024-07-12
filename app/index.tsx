import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Pressable } from "react-native";
import * as ScreenOrientation from 'expo-screen-orientation';

const DEFAULT_TIME = 6 * 60; // 6 minutes in seconds

export default function Index() {
  const [time, setTime] = useState(DEFAULT_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [orientation, setOrientation] = useState(ScreenOrientation.Orientation.PORTRAIT_UP);

  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
    };
    lockOrientation();

    const subscription = ScreenOrientation.addOrientationChangeListener(({ orientationInfo }) => {
      setOrientation(orientationInfo.orientation);
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

  const isLandscape = orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT || orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;

  return (
    <View style={[styles.container, isLandscape ? styles.containerLandscape : styles.containerPortrait]}>
      <Text style={styles.timerText}>{formatTime(time)}</Text>
      <Pressable onPress={handlePlayPause} style={styles.button}>
        <Text style={styles.buttonText}>{isRunning ? 'Pause' : 'Play'}</Text>
      </Pressable>
      <Pressable onPress={handleReset} style={styles.button}>
        <Text style={styles.buttonText}>Reset</Text>
      </Pressable>
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
  containerLandscape: {
    flexDirection: 'row',
  },
  containerPortrait: {
    flexDirection: 'column',
  },
  timerText: {
    color: '#FFD700',
    fontSize: 80,
    fontFamily: 'Roboto',
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#444',
    borderRadius: 5,
    marginHorizontal: 10,
  },
  buttonText: {
    color: '#FFD700',
    fontSize: 24,
  },
});
