import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

/** Magic UI ShimmerButton: a glass pill with a highlight sweeping across it. */
export const ShimmerButton = forwardRef(({ children, className, as: Comp = 'button', ...props }, ref) => (
  <Comp
    ref={ref}
    className={cn(
      'group relative inline-flex h-14 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full border border-ink/20 bg-ink/10 px-8 font-display font-medium text-ink backdrop-blur transition-transform duration-300 active:translate-y-px',
      className
    )}
    {...props}
  >
    <span
      aria-hidden
      className="absolute inset-0 animate-shimmer"
      style={{ backgroundImage: 'linear-gradient(110deg, transparent 35%, rgb(var(--accent) / 0.55) 50%, transparent 65%)', backgroundSize: '200% 100%', backgroundRepeat: 'no-repeat' }}
    />
    <span className="relative z-10 flex items-center gap-2">{children}</span>
    <span aria-hidden className="absolute inset-0 rounded-full shadow-[inset_0_-8px_10px_rgb(var(--accent)/0.18)] transition-shadow duration-300 group-hover:shadow-[inset_0_-6px_10px_rgb(var(--accent)/0.4)]" />
  </Comp>
));
ShimmerButton.displayName = 'ShimmerButton';
