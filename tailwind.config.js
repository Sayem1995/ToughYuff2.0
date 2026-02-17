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
        background: '#F8F9FA', // Light gray/whiteish
        surface: '#FFFFFF',    // Pure white
        elevated: '#FFFFFF',   // Pure white
        'card-bg': 'rgba(0,0,0,0.03)', // Subtle dark tint
        gold: {
          DEFAULT: '#D4AF37',
          glow: 'rgba(212,175,55,0.15)',
          subtle: 'rgba(212,175,55,0.05)',
        },
        accent: {
          blue: '#3B82F6',
          blueGlow: 'rgba(59,130,246,0.15)',
        },
        text: {
          primary: '#1A1A1A',   // Near black
          secondary: 'rgba(0,0,0,0.6)',
          tertiary: 'rgba(0,0,0,0.4)',
        }
      },
      fontFamily: {
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
      }
    },
  },
  plugins: [],
}
