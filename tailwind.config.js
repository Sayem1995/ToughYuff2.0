export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF', // Pure white (was Alabaster/light)
        surface: '#FFFFFF',    // Pure white
        elevated: '#FFFFFF',   // Lighter for floating elements
        'card-bg': 'rgba(0,0,0,0.03)', // Subtle dark tint for light mode
        gold: {
          DEFAULT: '#C9A84C',  // Champagne
          glow: 'rgba(201,168,76,0.15)',
          subtle: 'rgba(201,168,76,0.05)',
        },
        accent: {
          blue: '#3B82F6',     // Kept for utility consistency if used
          blueGlow: 'rgba(59,130,246,0.15)',
        },
        text: {
          primary: '#0A0A0E',   // Jet Black
          secondary: 'rgba(10,10,14,0.6)',
          tertiary: 'rgba(10,10,14,0.4)',
          dark: '#0A0A0E',      // dark text
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      spacing: {
        '18': '4.5rem',
      }
    },
  },
  plugins: [],
}
