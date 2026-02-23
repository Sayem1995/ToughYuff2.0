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
        background: '#0D0D12', // Obsidian
        surface: '#15151A',    // Slightly lighter Obsidian
        elevated: '#1A1A22',   // Lighter for floating elements
        'card-bg': 'rgba(255,255,255,0.03)', // Subtle light tint for dark mode
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
          primary: '#FAF8F5',   // Ivory
          secondary: 'rgba(250,248,245,0.6)',
          tertiary: 'rgba(250,248,245,0.4)',
          dark: '#2A2A35',      // Slate text for light backgrounds
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
