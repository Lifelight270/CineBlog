import { cn } from '@/lib/utils';

/** Magic UI BorderBeam: a light that travels around the edge of its parent (parent must be relative). */
export const BorderBeam = ({ size = 160, duration = 10, delay = 0, className }) => (
  <div
    aria-hidden
    style={{ '--size': size, '--duration': `${duration}s`, '--delay': `-${delay}s` }}
    className={cn(
      'pointer-events-none absolute inset-0 rounded-[inherit] [border:1.5px_solid_transparent] ![mask-clip:padding-box,border-box] ![mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]',
      'after:absolute after:aspect-square after:w-[calc(var(--size)*1px)] after:animate-beam after:[animation-delay:var(--delay)] after:[background:linear-gradient(to_left,rgb(var(--accent)),transparent_70%)] after:[offset-anchor:90%_50%] after:[offset-path:rect(0_auto_auto_0_round_24px)]',
      className
    )}
  />
);
