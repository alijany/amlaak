import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/ui/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FC4258',
          50:  '#FFF1F3',
          100: '#FFE3E7',
          200: '#FFCAD2',
          300: '#FFA7B4',
          400: '#FF7185',
          500: '#FC4258',
          600: '#E0394D',
          700: '#B0263A',
        },
        brand: {
          slate: {
            50:  '#F8F9FC',
            100: '#EEF0F6',
            200: '#DDE2EC',
            300: '#CED3DE',
            400: '#98A0B3',
            500: '#6B7488',
            600: '#4A546B',
            700: '#36425D',
            800: '#1F2A44',
            900: '#0F172A',
          }
        }
      },
      fontFamily: {
        dana: ['var(--font-dana)'],
        yekan: ['var(--font-dana)'],
      },
    },
  },
  plugins: [],
} satisfies Config;
