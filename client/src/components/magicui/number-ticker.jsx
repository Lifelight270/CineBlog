import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'motion/react';

/** Magic UI NumberTicker: counts up once it scrolls into view. */
export const NumberTicker = ({ value, className }) => {
  const ref = useRef(null);
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { damping: 60, stiffness: 90 });
  const inView = useInView(ref, { once: true, margin: '0px' });

  useEffect(() => { if (inView) mv.set(value); }, [inView, value, mv]);
  useEffect(
    () => spring.on('change', (v) => { if (ref.current) ref.current.textContent = Intl.NumberFormat('en-US').format(Math.round(v)); }),
    [spring]
  );
  return <span ref={ref} className={className}>0</span>;
};
