import { useEffect } from 'react';
import { motion, stagger, useAnimate, useInView } from 'motion/react';
import { cn } from '@/lib/utils';

/** Aceternity-style TextGenerateEffect: words fade and unblur in one after another. */
export const TextGenerateEffect = ({ words, className, duration = 0.5 }) => {
  const [scope, animate] = useAnimate();
  const inView = useInView(scope, { once: true, margin: '-10% 0px' });
  const list = words.split(' ');

  useEffect(() => {
    if (inView) animate('span', { opacity: 1, filter: 'blur(0px)' }, { duration, delay: stagger(0.08) });
  }, [inView, animate, duration]);

  return (
    <motion.div ref={scope} className={cn(className)}>
      {list.map((w, i) => (
        <motion.span key={`${w}-${i}`} className="opacity-0" style={{ filter: 'blur(10px)' }}>
          {w}{' '}
        </motion.span>
      ))}
    </motion.div>
  );
};
