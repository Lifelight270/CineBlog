import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { motion, useScroll, useSpring } from 'motion/react';
import { Heart, Link2, Pencil, Trash2, Clock, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Cover } from '@/components/PostCard';
import { formatDate, hash } from '@/lib/utils';

const SCENE_ORDER = ['plum', 'lagoon', 'amber', 'dusk'];

function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return <motion.div style={{ scaleX }} className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-accent" />;
}

function Comments({ postId }) {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { api.posts.comments(postId).then((d) => setList(d.comments)).catch(() => {}); }, [postId]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { comment } = await api.posts.addComment(postId, body);
      setList((l) => [comment, ...l]);
      setBody('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    try {
      await api.removeComment(id);
      setList((l) => l.filter((c) => c._id !== id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <section className="mt-20 max-w-[66ch]" aria-labelledby="comments-title">
      <h2 id="comments-title" className="text-3xl font-semibold">Comments ({list.length})</h2>
      {user ? (
        <form onSubmit={submit} className="mt-6">
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Add to the conversation" maxLength={1000} aria-label="Your comment" />
          <Button className="mt-3" type="submit" disabled={busy || !body.trim()}>{busy ? 'Posting…' : 'Post comment'}</Button>
        </form>
      ) : (
        <p className="glass mt-6 rounded-2xl p-5 text-ink/80"><Link to="/login" className="font-semibold text-accent underline underline-offset-4">Sign in</Link> to join the conversation.</p>
      )}
      <ul className="mt-8 space-y-4">
        {list.map((c) => (
          <motion.li key={c._id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between text-sm text-ink/60">
              <span className="font-display font-medium text-ink">{c.author?.name}</span>
              <span className="flex items-center gap-3">
                {formatDate(c.createdAt)}
                {user && (String(c.author?._id) === String(user.id) || user.role === 'admin') && (
                  <button onClick={() => remove(c._id)} aria-label="Delete comment" className="text-ink/50 hover:text-red-400"><Trash2 size={15} /></button>
                )}
              </span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-base">{c.body}</p>
          </motion.li>
        ))}
        {list.length === 0 && <li className="text-ink/60">No comments yet. Be the first to write one.</li>}
      </ul>
    </section>
  );
}

export default function Post() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    setPost(null);
    setError('');
    api.posts.get(slug).then((d) => setPost(d.post)).catch((e) => setError(e.message));
  }, [slug]);

  const like = async () => {
    if (!user) return toast('Sign in to like articles.');
    try {
      const r = await api.posts.like(post._id);
      setPost((p) => ({ ...p, liked: r.liked, likeCount: r.likeCount }));
    } catch (e) {
      toast.error(e.message);
    }
  };

  const remove = async () => {
    try {
      await api.posts.remove(post._id);
      toast.success('Article deleted.');
      navigate('/dashboard');
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (error)
    return (
      <main className="container-x grid min-h-screen place-items-center text-center">
        <div>
          <h1 className="text-5xl font-semibold">Article not found</h1>
          <p className="mt-3 text-ink/70">{error}</p>
          <Button asChild className="mt-6"><Link to="/blog">Browse articles</Link></Button>
        </div>
      </main>
    );

  if (!post)
    return (
      <main className="container-x pt-40"><Skeleton className="h-16 w-3/4" /><Skeleton className="mt-6 h-80" /></main>
    );

  const mine = user && (String(post.author?._id) === String(user.id) || user.role === 'admin');
  const scene = SCENE_ORDER[hash(post.category) % SCENE_ORDER.length];

  return (
    <main data-scene={scene} className="relative z-10 pb-24 pt-36">
      <ReadingProgress />
      <article className="container-x">
        <Badge>{post.category}</Badge>
        <h1 className="mt-5 max-w-[18ch] text-[clamp(2.6rem,7vw,5.5rem)] font-semibold">{post.title}</h1>
        <p className="mt-6 max-w-[52ch] text-2xl text-ink/75">{post.excerpt}</p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-ink/65">
          <span className="font-display font-medium text-ink">{post.author?.name}</span>
          <span>{formatDate(post.createdAt)}</span>
          <span className="flex items-center gap-1"><Clock size={15} />{post.readTime} min read</span>
          <span className="flex items-center gap-1"><Eye size={15} />{post.views}</span>
        </div>

        <Cover post={post} className="mt-12 aspect-[21/9] w-full rounded-[2rem]" />
        {post.coverImageCredit && (
          <p className="mt-2 text-sm text-ink/60">
            Image: {post.coverImageCredit}
            {post.coverImageSource && <> · <a href={post.coverImageSource} target="_blank" rel="noreferrer" className="underline underline-offset-2">Source</a></>}
          </p>
        )}

        <div className="mt-12 flex flex-wrap items-center gap-3">
          <Button variant={post.liked ? 'default' : 'glass'} onClick={like} aria-pressed={post.liked}>
            <motion.span key={String(post.liked)} initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 12 }} className="flex">
              <Heart size={17} fill={post.liked ? 'currentColor' : 'none'} />
            </motion.span>
            {post.likeCount}
          </Button>
          <Button variant="glass" onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied.'); }}><Link2 size={16} />Copy link</Button>
          {mine && (
            <>
              <Button asChild variant="glass"><Link to={`/write/${post._id}`}><Pencil size={16} />Edit</Link></Button>
              <Button variant="ghost" onClick={() => setConfirm(true)}><Trash2 size={16} />Delete</Button>
            </>
          )}
        </div>

        <div className="prose-post mt-12 text-[1.2rem]"><ReactMarkdown>{post.content}</ReactMarkdown></div>

        {post.tags?.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {post.tags.map((t) => <Link key={t} to={`/blog?search=${t}`} className="glass rounded-full px-4 py-1.5 font-display text-sm hover:bg-ink/15">#{t}</Link>)}
          </div>
        )}

        <Comments postId={post._id} />
      </article>

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogTitle>Delete this article?</DialogTitle>
          <DialogDescription>“{post.title}” and its comments will be removed for good.</DialogDescription>
          <div className="mt-6 flex justify-end gap-3">
            <DialogClose asChild><Button variant="ghost">Keep it</Button></DialogClose>
            <Button variant="destructive" onClick={remove}>Delete article</Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
