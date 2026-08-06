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
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // AI Summit custom colors — consumed as dynamic class strings by
        // lib/themes.ts on the legacy [eventSlug] route. Do not remove.
        'ai-orange': '#FF5733',
        'ai-red': '#C70039',
        'ai-burgundy': '#900C3F',
        // Organization-level colors
        'org-accent': '#E8523F',
        'org-accent-light': '#F06B5A',
        'org-accent-dark': '#D04535',

        // ---- Barcelona after midnight -------------------------------------
        // Coloured darks, never pure black, punctuated by two drenched neon
        // bands. Contrast is measured against the ground each is used on.
        // Named 'night-*' so they cannot collide with the semantic `ink`
        // token below, which is the TEXT colour, not a ground.
        'night-ink': '#06060E', // violet-black, deepest ground
        'night-raised': '#0B0A16', // the constant card colour
        // 'night-' prefixed: bare `indigo`/`violet`/`amber` would REPLACE
        // Tailwind's default scales, breaking bg-indigo-600 and bg-amber-500
        // in the legacy components and lib/themes.ts.
        'night-indigo': '#140F26',
        'night-violet': '#241242',
        'neon-pink': '#FF3D9A', // 5.15-6.14:1 on every dark rung; drenched band
        'neon-cyan': '#4DE3E8', // 10.86-12.95:1 on every dark rung; closes the page
        'sea-0': '#04080F',
        'sea-1': '#07131F',
        'sea-2': '#0B2030',
        'sea-3': '#0E2A3C',
        screen: '#E6E8F2', // cool white — everything rendered. 16.5:1 on ink
        'screen-dim': '#9AA0BF', // 7.8:1 on ink
        paper: '#EFEADF', // warm bone — physical objects only: frames, plates

        // Register-aware semantics, driven by data-register in globals.css.
        // Channel triplets so opacity modifiers (bg-accent/10) resolve.
        ground: 'rgb(var(--ground) / <alpha-value>)',
        'ground-raised': 'rgb(var(--ground-raised) / <alpha-value>)',
        'band-2': 'rgb(var(--band-2) / <alpha-value>)',
        'band-3': 'rgb(var(--band-3) / <alpha-value>)',
        'band-4': 'rgb(var(--band-4) / <alpha-value>)',
        inversion: 'rgb(var(--inversion) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        'ink-dim': 'rgb(var(--ink-dim) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        'accent-alt': 'rgb(var(--accent-alt) / <alpha-value>)',
      },
      borderRadius: {
        // The signet is drawn on a 5-unit grid with 0.75-radius corner arcs.
        // Scaled to the 4px module that gives a 2px soft pixel: the only
        // radius the night register uses. Legacy keeps Tailwind's defaults.
        pixel: '2px',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      spacing: {
        module: '4px',
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
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        marquee: 'marquee 30s linear infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;