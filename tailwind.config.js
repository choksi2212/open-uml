/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './app/renderer/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Semantic color tokens. Values come from CSS vars in index.css so
      // :root / .dark can swap them. Naming follows IDE conventions
      // (bg, surface, fg, border, accent) rather than Tailwind's color
      // ramps (slate-500, blue-600) - tools should feel like tools.
      colors: {
        bg: 'var(--bg)',
        'bg-elevated': 'var(--bg-elevated)',
        surface: {
          1: 'var(--surface-1)',
          2: 'var(--surface-2)',
          3: 'var(--surface-3)',
        },
        fg: 'var(--fg)',
        'fg-muted': 'var(--fg-muted)',
        'fg-subtle': 'var(--fg-subtle)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'accent-active': 'var(--accent-active)',
        'accent-fg': 'var(--accent-fg)',
        'accent-soft': 'var(--accent-soft)',
        warn: 'var(--warn)',
        danger: 'var(--danger)',
        'danger-hover': 'var(--danger-hover)',
        ring: 'var(--ring)',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['"IBM Plex Mono"', '"JetBrains Mono"', 'Menlo', 'Consolas', 'monospace'],
      },
      fontSize: {
        'display-sm': ['18px', { lineHeight: '24px', letterSpacing: '-0.005em', fontWeight: '600' }],
        'display-md': ['22px', { lineHeight: '28px', letterSpacing: '-0.01em', fontWeight: '600' }],
      },
      borderRadius: {
        // Single restrained scale - the SaaS card kit uses one radius for
        // everything. Different elements get different radii by purpose.
        DEFAULT: '4px',
        sm: '3px',
        md: '6px',
        lg: '8px',
      },
      boxShadow: {
        'panel': '0 1px 0 0 var(--border)',
        'popover': '0 4px 16px -4px rgb(0 0 0 / 0.18), 0 0 0 1px var(--border)',
        'overlay': '0 12px 32px -8px rgb(0 0 0 / 0.32), 0 0 0 1px var(--border)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.98) translateY(-2px)' },
          to: { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
      animation: {
        'fade-in': 'fade-in 120ms ease-out',
        'scale-in': 'scale-in 120ms ease-out',
        'pulse-dot': 'pulse-dot 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
