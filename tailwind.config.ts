import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8f5ef',
        foreground: '#1f1a17',
        muted: '#6b625d',
        accent: '#8b5a2b',
        accentSoft: '#f3dfc8',
        panel: '#fffaf3'
      },
      boxShadow: {
        soft: '0 20px 60px rgba(80, 49, 22, 0.12)'
      },
      backgroundImage: {
        'grain': 'radial-gradient(circle at top left, rgba(139,90,43,0.15), transparent 35%), radial-gradient(circle at bottom right, rgba(31,26,23,0.08), transparent 30%)'
      }
    }
  },
  plugins: []
};

export default config;
