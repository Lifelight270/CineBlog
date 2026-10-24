import { Link } from 'react-router-dom';
import { Heart, Clock } from 'lucide-react';
import { Card3D } from '@/components/aceternity/card-3d';
import { Badge } from '@/components/ui/badge';
import { coverGradient, formatDate, cn } from '@/lib/utils';

export const Cover = ({ post, className }) =>
  post.coverImage ? (
    <img src={post.coverImage} alt="" loading="lazy" className={cn('object-cover', className)} />
  ) : (
    <div className={className} style={{ background: coverGradient(post.title) }} aria-hidden />
  );

export default function PostCard({ post, className }) {
  return (
    <Card3D className={className}>
      <Link to={`/blog/${post.slug}`} className="glass group flex h-full flex-col overflow-hidden rounded-3xl">
        <div className="overflow-hidden" data-depth>
          <Cover post={post} className="aspect-[16/10] w-full transition-transform duration-700 group-hover:scale-105" />
        </div>
        {post.coverImageCredit && <p className="px-6 pt-3 text-xs text-ink/55">Image: {post.coverImageCredit}</p>}
        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-center gap-3">
            <Badge>{post.category}</Badge>
            <span className="flex items-center gap-1 text-sm text-ink/60"><Clock size={13} />{post.readTime} min</span>
          </div>
          <h3 className="mt-4 text-2xl font-semibold" data-depth>{post.title}</h3>
          <p className="mt-3 line-clamp-3 flex-1 text-base text-ink/70">{post.excerpt}</p>
          <div className="mt-5 flex items-center justify-between text-sm text-ink/60">
            <span>{post.author?.name} · {formatDate(post.createdAt)}</span>
            <span className="flex items-center gap-1"><Heart size={14} />{post.likeCount}</span>
          </div>
        </div>
      </Link>
    </Card3D>
  );
}
