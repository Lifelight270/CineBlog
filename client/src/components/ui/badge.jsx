import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center rounded-full px-3 py-1 font-display text-xs font-medium', {
  variants: {
    variant: {
      default: 'bg-accent/20 text-accent',
      glass: 'glass text-ink/90',
      outline: 'border border-ink/25 text-ink/80',
    },
  },
  defaultVariants: { variant: 'default' },
});

export const Badge = ({ className, variant, ...props }) => (
  <span className={cn(badgeVariants({ variant }), className)} {...props} />
);
