/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        blueScheme: {
          uncompleted: '#3b82f6',
          completed: '#1e40af'
        },
        indigoScheme: {
          uncompleted: '#6366f1',
          completed: '#3730a3'
        },
        specOrange: '#f97316'
      }
    }
  },
  plugins: []
};

