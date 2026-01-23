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
          dark: "#08283B",
          darker: "#042133",
          darkest: "#093A57",
          cyan: "#00E2B3",
          blue: "#3298DA",
          light: "#E8ECF4",
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['Roboto Mono', 'SF Mono', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
