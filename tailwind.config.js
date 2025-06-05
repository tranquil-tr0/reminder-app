/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2196F3',
        background: '#1C1C1E',
        surface: '#2C2C2E',
        'text-primary': '#FFFFFF',
        'text-secondary': '#8E8E93',
        'tab-bar': {
          background: '#1C1C1E',
          inactive: '#8E8E93',
          active: '#2196F3'
        },
        divider: '#38383A',
        error: '#FF453A',
        success: '#32D74B'
      }
    }
  },
  plugins: [],
}