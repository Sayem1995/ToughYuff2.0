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
        background: '#050508',
        surface: '#0a0a12',
        elevated: '#10101a',
        'card-bg': 'rgba(255,255,255,0.03)',
        gold: {
          DEFAULT: '#D4AF37',
          glow: 'rgba(212,175,55,0.3)',
          subtle: 'rgba(212,175,55,0.15)',
        },
        accent: {
          blue: '#3B82F6',
          blueGlow: 'rgba(59,130,246,0.3)',
        },
        text: {
          primary: '#FFFFFF',
          secondary: 'rgba(255,255,255,0.6)',
          tertiary: 'rgba(255,255,255,0.4)',
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
