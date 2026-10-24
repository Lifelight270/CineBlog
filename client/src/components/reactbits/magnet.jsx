import { useEffect, useRef } from 'react';
import { motion, useSpring } from 'motion/react';
import { cn } from '@/lib/utils';

/** React Bits Magnet: the child leans toward the pointer when it comes within `padding` px. */
export default function Magnet({ children, padding = 90, strength = 3, className }) {
  const ref = useRef(null);
  const x = useSpring(0, { stiffness: 170, damping: 15, mass: 0.2 });
  const y = useSpring(0, { stiffness: 170, damping: 15, mass: 0.2 });

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return undefined;
    const onMove = (e) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2 - x.get();
      const cy = r.top + r.height / 2 - y.get();
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const near = Math.abs(dx) < r.width / 2 + padding && Math.abs(dy) < r.height / 2 + padding;
      x.set(near ? dx / strength : 0);
      y.set(near ? dy / strength : 0);
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [padding, strength, x, y]);

  return (
    <motion.div ref={ref} style={{ x, y }} className={cn('inline-block', className)}>
      {children}
    </motion.div>
  );
}
