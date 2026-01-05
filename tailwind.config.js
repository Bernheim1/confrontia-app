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
        // Colores principales: Sobrios, confiables y modernos
        primary: {
          50: '#e0e7ff',  // Azul marino claro para fondos suaves
          100: '#c5d2e1',  // Para bordes o áreas secundarias
          200: '#a1b5c7',  // Para hover de menús
          300: '#8a99b0',  // Para áreas secundarias y menos resaltadas
          400: '#637694',  // Azul marino medio para botones activos
          500: '#334b70',  // Azul marino base, para elementos de alto contraste
          600: '#2c3d56',  // Un tono más oscuro para el navbar y fondo de sidebar
          700: '#1c2a3d',  // Ideal para el texto en modo oscuro
          800: '#1b2431',  // Para elementos de fondo o de baja jerarquía
          900: '#101d2d',  // Para fondos principales en modo oscuro
          950: '#0a1520',  // Fondo muy oscuro para áreas sin contenido o secundarias
        },

        // Colores de acento: Agregar elegancia y modernidad con toques metálicos
        accent: {
          50:  '#e6f0ff', // Fondos muy sutiles (hover suave, highlights)
          100: '#cfe0f5', // Fondos secundarios, inputs focus suaves
          200: '#a9c3e6', // Hover de links o tabs
          300: '#7fa2d4', // Estados activos secundarios
          400: '#5c88c2', // Accent visible pero sobrio
          500: '#3f6fb0', // Accent base (links principales, CTA discreto)
          600: '#355e97', // Hover / pressed del accent
          700: '#2c4c7a', // Texto accent en fondos claros
          800: '#223a5c', // Para fondos o badges oscuros
          900: '#18283f', // Accent oscuro en modo dark
          950: '#0f1b2b', // Muy oscuro, casi integrado al primary
        },

        // Colores secundarios: Para textos y fondos neutros
        surface: {
          light: '#f6f8fb',   // fondo general
          card:  '#ffffff',
          dark:  '#0f1b2d',   // dark real, NO negro
        },
        muted: '#868e96',  // Gris para los textos secundarios y menos importantes
        text: '#495057',  // Gris oscuro para el texto principal
        textDark: '#f1f3f5', // Texto en modo oscuro (para contraste)
          ink: {
          light: '#0b1b33',   // texto principal
          muted: '#4a5b75',
          dark:  '#e5ebf3',
        },
        // Colores para alertas
        danger: '#dc3545',  // Rojo para errores
        success: '#28a745',  // Verde para éxito
        warning: '#ffc107',  // Amarillo para advertencias
      },
      borderRadius: {
        base: '0.5rem',  // Bordes redondeados
        lg: '0.75rem',  // Bordes más suaves para tarjetas y botones
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
