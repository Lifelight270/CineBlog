import { useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Aceternity-style 3D card: the card tilts toward the pointer and any
 * child marked with data-depth floats forward in Z.
 */
export const Card3D = ({ children, className, intensity = 14 }) => {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1000px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg)`;
  };
  const reset = () => {
    if (ref.current) ref.current.style.transform = 'perspective(1000px) rotateY(0) rotateX(0)';
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className={cn('transition-transform duration-200 ease-out [transform-style:preserve-3d] [&_[data-depth]]:transition-transform [&_[data-depth]]:duration-200 hover:[&_[data-depth]]:[transform:translateZ(40px)]', className)}
    >
      {children}
    </div>
  );
};
