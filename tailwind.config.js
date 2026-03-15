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
        background: '#FFFFFF',
        surface: '#FFFFFF',
        elevated: '#FFFFFF',
        'card-bg': 'rgba(0,0,0,0.03)',
        primary: "#ec5b13",
        gold: {
          DEFAULT: '#D4AF37',
          glow: 'rgba(212, 175, 55, 0.15)',
          subtle: 'rgba(212, 175, 55, 0.05)',
        },
        "background-light": "#f8f6f6",
        "background-dark": "#221610",
        accent: {
          blue: '#3B82F6',
          blueGlow: 'rgba(59,130,246,0.15)',
        },
        text: {
          primary: '#0A0A0E',
          secondary: 'rgba(10,10,14,0.6)',
          tertiary: 'rgba(10,10,14,0.4)',
          dark: '#0A0A0E',
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
        display: ["Public Sans", "sans-serif"],
      },
      spacing: {
        '18': '4.5rem',
      }
    },
  },
  plugins: [],
}
