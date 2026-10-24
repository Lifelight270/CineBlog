import { cn } from '@/lib/utils';

/** Magic UI Marquee: infinite horizontal loop, pauses on hover. */
export const Marquee = ({ children, reverse, pauseOnHover = true, className, duration = '40s', gap = '1rem' }) => (
  <div
    className={cn('group flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]', className)}
    style={{ '--duration': duration, '--gap': gap, gap }}
  >
    {[0, 1].map((i) => (
      <div
        key={i}
        aria-hidden={i === 1}
        className={cn('flex shrink-0 animate-marquee items-center justify-around', pauseOnHover && 'group-hover:[animation-play-state:paused]', reverse && '[animation-direction:reverse]')}
        style={{ gap }}
      >
        {children}
      </div>
    ))}
  </div>
);
