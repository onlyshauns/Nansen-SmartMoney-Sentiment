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
        nansen: {
          dark: "#0a0e1a",
          darker: "#060912",
          green: "#00ff88",
          blue: "#4a90ff",
          light: "#e8ecf4",
        },
      },
    },
  },
  plugins: [],
};
export default config;
