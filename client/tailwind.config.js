module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f5f5',
          100: '#e0e0e0',
          600: '#1a1a1a',
          700: '#111111',
          800: '#0a0a0a',
          900: '#000000',
        },
        accent: {
          300: '#ffe066',
          400: '#ffd500',
          500: '#ffc800',
          600: '#e6b400',
        },
        cream: {
          50: '#ffebc5',   // lighter tint — good for cards/inputs sitting on top of the main bg
          100: '#fed68a',  // your exact color — main site background
          200: '#d8b675',  // deeper shade — for section separation / footers
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};