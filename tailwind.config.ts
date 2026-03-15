import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        clay: {
          50: "#faf6f1",
          100: "#f0e6d6",
          200: "#e0ccad",
          300: "#cdab7e",
          400: "#be8f59",
          500: "#b17a43",
          600: "#9a6338",
          700: "#7d4d30",
          800: "#67402c",
          900: "#573627",
        },
        kiln: {
          50: "#f7f3f0",
          100: "#ece4db",
          200: "#d9c8b6",
          300: "#c2a68b",
          400: "#af8768",
          500: "#a27352",
          600: "#956346",
          700: "#7c4f3b",
          800: "#664235",
          900: "#54382e",
        },
      },
    },
  },
  plugins: [],
};

export default config;
