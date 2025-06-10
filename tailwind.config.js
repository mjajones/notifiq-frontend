/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Page colors
        'background': '#F0F2F5', // Light gray background for the page
        'foreground': '#FFFFFF', // White background for cards

        // Sidebar colors
        'sidebar': '#111827',     // Dark background for the sidebar
        'sidebar-hover': '#1F2937', // Hover color for sidebar links

        // Brand/Accent color
        'primary': '#2C64E4',
        'primary-hover': '#1A4DBE',

        // Text colors
        'text-primary': '#18181B',
        'text-secondary': '#6B7280',
        'text-on-sidebar': '#E5E7EB', // Text color for use on the dark sidebar

        // Border color
        'border': '#E5E7EB',
      },
    },
  },
  plugins: [],
};