import { Theme } from '@react-navigation/native';

export const lightNavigationTheme: Theme = {
  dark: false,
  colors: {
    primary: '#2196F3',
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#000000',
    border: '#E5E5E7',
    notification: '#2196F3',
  },
  fonts: {
    regular: {
      fontFamily: 'System',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    bold: {
      fontFamily: 'System',
      fontWeight: 'bold',
    },
    heavy: {
      fontFamily: 'System',
      fontWeight: '700',
    },
  },
};

export const darkNavigationTheme: Theme = {
  dark: true,
  colors: {
    primary: '#2196F3',
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    border: '#38383A',
    notification: '#2196F3',
  },
  fonts: {
    regular: {
      fontFamily: 'System',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    bold: {
      fontFamily: 'System',
      fontWeight: 'bold',
    },
    heavy: {
      fontFamily: 'System',
      fontWeight: '700',
    },
  },
};

export function getNavigationTheme(isDark: boolean): Theme {
  return isDark ? darkNavigationTheme : lightNavigationTheme;
}