import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        serva: {
          green: "#2D7A4F",
          "green-dark": "#1F5C3A",
          "green-light": "#3DA066",
          "green-pale": "#E8F5EE",
          "green-mid": "#C5E8D5",
        },
      },
      fontFamily: {
        sans: ["Montserrat", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
