/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
      extend: {
        colors: {
          dark: "#0B0F19",
          glow: "#38bdf8",
        },
        animation: {
          "fade-up": "fadeUp 0.8s ease-out forwards",
          "float": "float 6s ease-in-out infinite",
        },
        keyframes: {
          fadeUp: {
            "0%": { opacity: 0, transform: "translateY(20px)" },
            "100%": { opacity: 1, transform: "translateY(0)" },
          },
          float: {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-20px)" },
          },
        },
      },
    },
    plugins: [],
  };