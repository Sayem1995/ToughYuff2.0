export default {
  darkMode: 'class',
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
        background: '#FAFAFA',
        surface: '#FFFFFF',
        elevated: '#FFFFFF',
        'card-bg': 'rgba(0,0,0,0.02)',
        primary: {
          DEFAULT: '#E85D04',
          light: '#F48A29',
          dark: '#D00000',
          glow: 'rgba(232, 93, 4, 0.15)',
          subtle: 'rgba(232, 93, 4, 0.05)',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#E5C75A',
          dark: '#B8941F',
          glow: 'rgba(212, 175, 55, 0.15)',
          subtle: 'rgba(212, 175, 55, 0.05)',
        },
        "background-light": "#F8F9FA",
        "background-dark": "#1A1A2E",
        accent: {
          blue: '#3B82F6',
          blueGlow: 'rgba(59,130,246,0.15)',
          purple: '#8B5CF6',
          teal: '#14B8A6',
        },
        text: {
          primary: '#0F172A',
          secondary: 'rgba(15,23,42,0.65)',
          tertiary: 'rgba(15,23,42,0.45)',
          dark: '#0F172A',
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Plus Jakarta Sans"', '"Public Sans"', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      boxShadow: {
        'soft': '0 2px 15px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px rgba(0, 0, 0, 0.08)',
        'large': '0 10px 40px rgba(0, 0, 0, 0.12)',
        'xl': '0 20px 60px rgba(0, 0, 0, 0.15)',
        'glow': '0 0 20px rgba(232, 93, 4, 0.3)',
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.3)',
        'inner-glow': 'inset 0 2px 4px rgba(255, 255, 255, 0.3)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #E85D04 0%, #F48A29 100%)',
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #E5C75A 100%)',
        'gradient-hero': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-surface': 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
        'gradient-card': 'linear-gradient(145deg, #FFFFFF 0%, #F8F9FA 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
