import { cn } from '@/lib/utils';

export const Skeleton = ({ className, ...props }) => (
  <div className={cn('animate-pulse rounded-2xl bg-ink/10', className)} {...props} />
);
