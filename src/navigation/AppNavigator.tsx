import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootTabParamList } from '../types';

// Import screens
import AlarmScreen from '../screens/AlarmScreen';
import TimerScreen from '../screens/TimerScreen';
import StopwatchScreen from '../screens/StopwatchScreen';
import ClockScreen from '../screens/ClockScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function AppNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#1C1C1E', // tab-bar-background from tailwind config
          borderTopColor: '#38383A', // divider from tailwind config
        },
        tabBarActiveTintColor: '#2196F3', // tab-bar-active from tailwind config
        tabBarInactiveTintColor: '#8E8E93', // tab-bar-inactive from tailwind config
        headerStyle: {
          backgroundColor: '#1C1C1E', // background from tailwind config
          borderBottomColor: '#38383A', // divider from tailwind config
          borderBottomWidth: 1,
        },
        headerTintColor: '#FFFFFF', // text-primary from tailwind config
        headerTitleStyle: {
          fontWeight: '400',
        },
      }}
    >
      <Tab.Screen
        name="Alarm"
        component={AlarmScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="alarm" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Clock"
        component={ClockScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="earth" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Timer"
        component={TimerScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="timer-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Stopwatch"
        component={StopwatchScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="timer" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}