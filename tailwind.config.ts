import type { Config } from "tailwindcss";

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './legal/**/*.{md,mdx}',
  ],
  safelist: [
    // AI Summit custom colors - ensure they're always included
    'bg-ai-orange',
    'text-ai-orange',
    'bg-ai-red', 
    'text-ai-red',
    'bg-ai-burgundy',
    'text-ai-burgundy',
    'from-ai-orange',
    'to-ai-orange',
    'from-ai-red',
    'to-ai-red',
    'from-ai-burgundy',
    'to-ai-burgundy',
    'via-ai-red',
    'via-ai-burgundy',
    'bg-gradient-to-r',
    'bg-gradient-to-br',
    'hover:bg-ai-red',
    'hover:bg-ai-orange',
    'hover:bg-gray-100',
    'text-white',
    'text-gray-100',
    'bg-white',
    'bg-gray-900',
    'bg-opacity-95',
    'border',
    'border-white'
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          light: 'hsl(var(--primary-light))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          light: 'hsl(var(--secondary-light))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          light: 'hsl(var(--accent-light))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // AI Summit custom colors
        'ai-orange': '#FF5733',
        'ai-red': '#C70039', 
        'ai-burgundy': '#900C3F',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        display: ['Orbitron', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 5px hsl(var(--primary)), 0 0 20px hsl(var(--primary-light))',
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(to right, hsl(var(--grid)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--grid)) 1px, transparent 1px)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;