/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        midnight: {
          950: '#08080a', // deep obsidian
          900: '#111114', // dark charcoal surface
          850: '#17171c', // rich onyx panel
          800: '#23232a', // refined border
          700: '#383842', // secondary border
          600: '#4e4e5c', // subtle icon/separator
        },
        lynx: {
          amber: '#f59e0b',  // radiant primary amber
          gold: '#fbbf24',   // brilliant accent gold
          bronze: '#d97706', // warm deep bronze
          copper: '#ea580c', // vivid fiery copper
          yellow: '#eab308', // sunshine highlight
          rose: '#f43f5e',   // dispute / danger alert
          charcoal: '#17171c',
        },
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

