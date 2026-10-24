import { cn } from '@/lib/utils';

export const Card = ({ className, ...props }) => <div className={cn('glass rounded-3xl', className)} {...props} />;
export const CardContent = ({ className, ...props }) => <div className={cn('p-6', className)} {...props} />;
