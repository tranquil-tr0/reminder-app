import React from 'react';
import { Text, SafeAreaView } from 'react-native';

export default function TimerScreen(): React.JSX.Element {
  return (
    <SafeAreaView className="flex-1 bg-background items-center justify-center">
      <Text className="text-text-primary text-lg">Timer Screen</Text>
    </SafeAreaView>
  );
}