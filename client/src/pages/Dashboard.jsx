import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Pencil, Trash2, Eye, Heart, Plus, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { formatDate } from '@/lib/utils';

export default function Dashboard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState(null);
  const [target, setTarget] = useState(null);

  useEffect(() => { api.posts.mine().then((d) => setPosts(d.posts)).catch((e) => { toast.error(e.message); setPosts([]); }); }, []);

  const remove = async () => {
    try {
      await api.posts.remove(target._id);
      setPosts((p) => p.filter((x) => x._id !== target._id));
      toast.success('Article deleted.');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setTarget(null);
    }
  };

  return (
    <main className="container-x relative z-10 pb-24 pt-36">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-[clamp(2.6rem,7vw,5rem)] font-semibold">Your writing</h1>
          <p className="mt-3 text-xl text-ink/70">Signed in as {user.name}.</p>
        </div>
        <Button asChild size="lg"><Link to="/write"><Plus size={18} />New article</Link></Button>
      </div>

      <div className="mt-12 space-y-4">
        {posts === null && [0, 1, 2].map((i) => <Skeleton key={i} className="h-28" />)}
        {posts?.map((p, i) => (
          <motion.div key={p._id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass flex flex-col gap-4 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <Badge variant={p.published ? 'default' : 'outline'}>{p.published ? 'Published' : 'Draft'}</Badge>
                <span className="text-sm text-ink/60">{formatDate(p.createdAt)}</span>
              </div>
              <h2 className="mt-2 truncate text-2xl font-semibold">{p.title}</h2>
              <p className="mt-1 flex items-center gap-4 text-sm text-ink/60"><span className="flex items-center gap-1"><Eye size={14} />{p.views}</span><span className="flex items-center gap-1"><Heart size={14} />{p.likeCount}</span></p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button asChild variant="ghost" size="icon" aria-label="View"><Link to={`/blog/${p.slug}`}><ExternalLink size={17} /></Link></Button>
              <Button asChild variant="glass" size="sm"><Link to={`/write/${p._id}`}><Pencil size={15} />Edit</Link></Button>
              <Button variant="ghost" size="icon" aria-label={`Delete ${p.title}`} onClick={() => setTarget(p)}><Trash2 size={17} /></Button>
            </div>
          </motion.div>
        ))}
        {posts?.length === 0 && (
          <div className="glass rounded-3xl p-12 text-center">
            <p className="font-display text-2xl font-semibold">You haven't written anything yet</p>
            <p className="mt-2 text-ink/70">Your first article takes about ten minutes. Start with something you learned this week.</p>
            <Button asChild className="mt-6"><Link to="/write">Write your first article</Link></Button>
          </div>
        )}
      </div>

      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent>
          <DialogTitle>Delete this article?</DialogTitle>
          <DialogDescription>“{target?.title}” and its comments will be removed for good.</DialogDescription>
          <div className="mt-6 flex justify-end gap-3">
            <DialogClose asChild><Button variant="ghost">Keep it</Button></DialogClose>
            <Button variant="destructive" onClick={remove}>Delete article</Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
