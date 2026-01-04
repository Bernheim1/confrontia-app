/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.{js,ts}"
  ],
  theme: {
    extend: {
      colors: {
        surface: '#f8fafc',
        accent: '#2563eb',
        muted: '#64748b'
      },
      borderRadius: {
        base: '8rem'
      }
    }
  },
  plugins: [
    require('flowbite/plugin')
  ],
};