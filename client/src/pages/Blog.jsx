import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import PostCard from '@/components/PostCard';
import { cn } from '@/lib/utils';

export default function Blog() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || 'all';
  const search = params.get('search') || '';
  const page = parseInt(params.get('page') || '1', 10);

  const [text, setText] = useState(search);
  const [categories, setCategories] = useState([]);
  const [result, setResult] = useState({ posts: [], pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v && v !== 'all' && !(k === 'page' && v === 1) ? next.set(k, v) : next.delete(k)));
    setParams(next, { replace: true });
  };

  useEffect(() => { api.posts.categories().then((d) => setCategories(d.categories)).catch(() => {}); }, []);

  // Debounce typing into the URL
  useEffect(() => {
    const t = setTimeout(() => { if (text !== search) update({ search: text, page: 1 }); }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  useEffect(() => {
    setLoading(true);
    api.posts
      .list({ category, search, page, limit: 9 })
      .then(setResult)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [category, search, page]);

  const clear = () => { setText(''); setParams({}, { replace: true }); };

  return (
    <main className="container-x relative z-10 pb-24 pt-36">
      <h1 className="max-w-[14ch] text-[clamp(3rem,8vw,6.5rem)] font-semibold">Articles</h1>
      <p className="mt-4 max-w-[46ch] text-xl text-ink/70">Search by title or tag, or filter by topic.</p>

      <div className="mt-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-ink/50" />
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Search articles" className="pl-11" aria-label="Search articles" />
        </div>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Topics">
          {[{ name: 'all', label: 'All' }, ...categories.map((c) => ({ name: c.name, label: c.name }))].map((c) => (
            <button
              key={c.name}
              role="tab"
              aria-selected={category === c.name}
              onClick={() => update({ category: c.name, page: 1 })}
              className={cn('relative rounded-full px-5 py-2 font-display text-sm font-medium transition-colors', category === c.name ? 'text-surface' : 'glass text-ink/80 hover:text-ink')}
            >
              {category === c.name && <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-accent" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
              <span className="relative">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[26rem]" />)
        ) : (
          <AnimatePresence mode="popLayout">
            {result.posts.map((p, i) => (
              <motion.div key={p._id} layout initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04, duration: 0.4 }}>
                <PostCard post={p} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {!loading && result.posts.length === 0 && (
        <div className="glass mx-auto mt-6 max-w-lg rounded-3xl p-10 text-center">
          <p className="font-display text-2xl font-semibold">No articles match</p>
          <p className="mt-2 text-ink/70">Try a different word, or clear the filters to see everything.</p>
          <Button className="mt-6" onClick={clear}>Clear filters</Button>
        </div>
      )}

      {result.pages > 1 && (
        <div className="mt-14 flex items-center justify-center gap-4">
          <Button variant="glass" size="icon" disabled={page <= 1} onClick={() => update({ page: page - 1 })} aria-label="Previous page"><ChevronLeft /></Button>
          <span className="font-display text-sm text-ink/70">Page {page} of {result.pages}</span>
          <Button variant="glass" size="icon" disabled={page >= result.pages} onClick={() => update({ page: page + 1 })} aria-label="Next page"><ChevronRight /></Button>
        </div>
      )}
    </main>
  );
}
