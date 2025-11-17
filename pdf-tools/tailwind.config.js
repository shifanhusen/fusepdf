/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#05060a',
        surface: '#0b0d13',
        'surface-muted': '#151821',
        'surface-border': '#202330',
        'text-muted': '#94a3b8',
        'brand-blue': '#38bdf8',
        'brand-green': '#34d399',
        danger: '#f87171',
      },
      boxShadow: {
        glow: '0 8px 30px rgba(56, 189, 248, 0.25)',
        card: '0 20px 60px rgba(0, 0, 0, 0.45)',
      },
    },
  },
  plugins: [],
};

export default config;

