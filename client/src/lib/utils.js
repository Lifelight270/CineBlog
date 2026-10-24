import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs) => twMerge(clsx(inputs));

export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const hash = (str = '') => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
};

// Deterministic gradient so posts without a cover image still get a distinct one.
export const coverGradient = (seed) => {
  const h = hash(seed);
  // Keep hues in the violet / magenta / coral range so covers sit well on every scene.
  const a = 235 + (h % 110);
  const b = (a + 45 + ((h >> 4) % 50)) % 360;
  return `radial-gradient(circle at ${20 + (h % 60)}% ${15 + (h % 50)}%, hsl(${b} 85% 62% / .9), transparent 55%), linear-gradient(135deg, hsl(${a} 70% 28%), hsl(${b} 65% 14%))`;
};
