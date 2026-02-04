/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        navy: '#0F172A',
        slate: '#475569',
        teal: '#14B8A6',
      },
    },
  },
  plugins: [],
}
