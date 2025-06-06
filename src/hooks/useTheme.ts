import { useColorScheme } from 'react-native';
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const theme = isDark ? MD3DarkTheme : MD3LightTheme;
  
  return {
    colorScheme,
    isDark,
    theme,
  };
}