/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Base colors for backgrounds
        'base-300': '#111827', // Darkest background (e.g., sidebar)
        'base-200': '#1F2937', // Main content background
        'base-100': '#374151', // Lighter background for elements like table headers, card footers

        // Content colors for text and icons
        'content-primary': '#F9FAFB', // Main text color
        'content-secondary': '#9CA3AF', // Lighter text for subtitles, placeholders
        'content-accent': '#6366F1',    // Accent color for highlights

        // Action colors
        'accent': '#6366F1', // Indigo, for primary buttons and active states
        'accent-hover': '#4F46E5',

        // Semantic colors for status, alerts, etc.
        'success': '#10B981',
        'warning': '#F59E0B',
        'error': '#EF4444',
      },
    },
  },
  plugins: [],
};
