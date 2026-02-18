/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        nature: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e', // Your primary green
          600: '#16a34a',
          700: '#15803d',
          900: '#064e3b',
        },
      },
    },
  },
  plugins: [],
}
