/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F7F4FB",
        ink: "#1B1E33",
        navy: "#15204A",
        navy2: "#26336E",
        roxo: "#9933CC",
        roxoSoft: "#F4EAFA",
        magenta: "#D91A7A",
        magentaSoft: "#FFEAF4",
        rosa: "#FF3399",
        muted: "#5D6079",
        line: "#E3E1EE",
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "Segoe UI", "system-ui", "sans-serif"],
        sans: ["Figtree", "Segoe UI", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(21,32,74,.04), 0 10px 28px -14px rgba(21,32,74,.16)",
      },
    },
  },
  plugins: [],
};
