/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.{js,ts}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Paleta principal basada en #08236e
        primary: {
          50: '#e6eaf3',
          100: '#ccd5e7',
          200: '#99abcf',
          300: '#6681b7',
          400: '#33579f',
          500: '#08236e',  // Color base de la marca
          600: '#071d5e',
          700: '#05164d',
          800: '#04103d',
          900: '#020a2e',
          950: '#01051f',
        },
        // Colores complementarios
        accent: {
          50: '#fef2e8',
          100: '#fde5d1',
          200: '#fbcba3',
          300: '#f9b175',
          400: '#f79747',
          500: '#f57d19',
          600: '#c46414',
          700: '#934b0f',
          800: '#62320a',
          900: '#311905',
        },
        surface: '#f8fafc',
        muted: '#64748b'
      },
      borderRadius: {
        base: '8rem'
      },
      keyframes: {
        'scale-up': {
          '0%': {
            transform: 'scaleY(0.4)',
            opacity: '0',
            transformOrigin: '100% 0%'
          },
          '100%': {
            transform: 'scaleY(1)',
            opacity: '1',
            transformOrigin: '100% 0%'
          }
        }
      },
      animation: {
        'scale-up': 'scale-up 0.4s cubic-bezier(0.390, 0.575, 0.565, 1.000) both'
      }
    }
  },
  plugins: [
    require('flowbite/plugin')
  ],
};