/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'task-blue': {
          uncompleted: '#3b82f6',
          completed: '#1e40af',
        },
        'task-indigo': {
          uncompleted: '#6366f1',
          completed: '#3730a3',
        },
        'task-orange': '#f97316',
      },
    },
  },
  plugins: [],
}
