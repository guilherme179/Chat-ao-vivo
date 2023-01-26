/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        login:{
          800: '#2c3338',
          700: '#363b41',
          600: '#3b4148',
          500: '#434a52',
        } 
      }
    },
  },
  plugins: [],
}
