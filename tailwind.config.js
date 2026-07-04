module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", 'sans-serif'],
        mono: ["'JetBrains Mono'", 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'pop': 'pop 0.2s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        pop: { '0%': { transform: 'scale(0.8)', opacity: 0 }, '70%': { transform: 'scale(1.05)' }, '100%': { transform: 'scale(1)', opacity: 1 } },
      }
    },
  },
  plugins: [],
}
