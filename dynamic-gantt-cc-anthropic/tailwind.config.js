/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'blue-uncompleted': '#3b82f6',
        'blue-completed': '#1e40af',
        'indigo-uncompleted': '#6366f1',
        'indigo-completed': '#3730a3',
        'progress-orange': '#f97316',
      },
    },
  },
  plugins: [],
}