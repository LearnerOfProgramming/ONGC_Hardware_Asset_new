/** @type {import('tailwindcss').Config} */
module.exports = {
  // important: "#root",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto']
      }
    },
  },
  plugins: [],
}

