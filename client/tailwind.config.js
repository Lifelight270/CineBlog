/** @type {import('tailwindcss').Config} */
const channel = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // These three are tweened by GSAP as the reader scrolls between scenes.
        surface: channel('bg'),
        ink: channel('ink'),
        accent: channel('accent'),
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Newsreader', 'ui-serif', 'Georgia', 'serif'],
      },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(calc(-100% - var(--gap)))' } },
        shimmer: { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
        beam: { to: { offsetDistance: '100%' } },
        spotlight: { '0%': { opacity: 0, transform: 'translate(-72%, -62%) scale(0.5)' }, '100%': { opacity: 1, transform: 'translate(-50%, -40%) scale(1)' } },
      },
      animation: {
        marquee: 'marquee var(--duration, 40s) linear infinite',
        shimmer: 'shimmer 3.2s linear infinite',
        beam: 'beam var(--duration, 12s) linear infinite',
        spotlight: 'spotlight 2s ease .75s 1 forwards',
      },
    },
  },
  plugins: [],
};
