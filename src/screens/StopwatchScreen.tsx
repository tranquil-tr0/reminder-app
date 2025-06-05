import React from 'react';
import { StyleSheet, Text, SafeAreaView } from 'react-native';
import Colors from '../constants/Colors';

export default function StopwatchScreen(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Stopwatch Screen</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: Colors.textPrimary,
    fontSize: 18,
  },
});