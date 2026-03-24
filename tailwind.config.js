/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brandGreen: '#004d30', // From your second image
        brandPink: '#ffcccc',  // From your first image
      }
    },
  },
  plugins: [],
}