import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import PostCard from '@/components/PostCard';
import ScrollText from '@/components/ScrollText';
import { Spotlight } from '@/components/aceternity/spotlight';
import { TextGenerateEffect } from '@/components/aceternity/text-generate-effect';
import { Marquee } from '@/components/magicui/marquee';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { BorderBeam } from '@/components/magicui/border-beam';
import { NumberTicker } from '@/components/magicui/number-ticker';
import SplitText from '@/components/reactbits/split-text';
import Magnet from '@/components/reactbits/magnet';

const Scene = lazy(() => import('@/components/three/Scene'));

function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} data-scene="dusk" className="relative flex min-h-screen items-center overflow-hidden">
      <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" />
      <motion.div style={{ y, opacity }} className="container-x relative z-10 pb-16 pt-32">
        <SplitText
          text="Stories from the space between design and code"
          className="max-w-[14ch] text-[clamp(2.9rem,6.4vw,6.2rem)] font-semibold lg:max-w-[15ch]"
        />
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="mt-8 max-w-[44ch] text-xl text-ink/75"
        >
          Essays on motion, interface craft and the web stack behind them. Scroll, and watch the page change its mind.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Magnet padding={60}>
            <ShimmerButton as={Link} to="/blog">Read the latest <ArrowRight size={18} /></ShimmerButton>
          </Magnet>
          <Magnet padding={60}>
            <Button asChild size="lg" variant="outline"><a href="#newsletter"><Mail size={18} />Get new articles</a></Button>
          </Magnet>
        </motion.div>
      </motion.div>
    </section>
  );
}

function Featured({ posts, loading }) {
  return (
    <section data-scene="plum" className="relative z-10 py-28">
      <div className="container-x">
        <TextGenerateEffect words="Three pieces to start with" className="max-w-[14ch] font-display text-[clamp(2.4rem,6vw,5rem)] font-semibold leading-[1.02] tracking-tight" />
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {loading
            ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-[26rem]" />)
            : posts.map((p, i) => (
                <div key={p._id} className={i === 1 ? 'md:mt-16' : i === 2 ? 'md:mt-32' : ''}>
                  <div className="relative rounded-3xl">
                    <PostCard post={p} />
                    {i === 0 && <BorderBeam duration={9} />}
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}

function Manifesto({ articles, topics }) {
  return (
    <section data-scene="lagoon" className="relative z-10 py-28">
      <ScrollText lines={['Scroll is time.', 'Colour is mood.', 'Motion is the voice', 'we tell it with.']} />
      <div className="container-x mt-16">
        <div className="glass relative mx-auto grid max-w-3xl grid-cols-2 gap-6 rounded-3xl p-8 text-center sm:p-10">
          <div>
            <NumberTicker value={articles} className="font-display text-6xl font-semibold text-accent" />
            <p className="mt-1 text-ink/70">articles</p>
          </div>
          <div>
            <NumberTicker value={topics} className="font-display text-6xl font-semibold text-accent" />
            <p className="mt-1 text-ink/70">topics</p>
          </div>
          <BorderBeam duration={14} />
        </div>
      </div>
    </section>
  );
}

function Topics({ categories, tags }) {
  const row = tags.length ? tags : ['motion', 'webgl', 'design', 'react'];
  const tagPill = (t) => (
    <Link key={t} to={`/blog?search=${encodeURIComponent(t)}`} className="glass rounded-full px-6 py-3 font-display text-lg hover:bg-ink/15">#{t}</Link>
  );
  return (
    <section data-scene="amber" className="relative z-10 py-28">
      <div className="container-x">
        <h2 className="max-w-[12ch] text-[clamp(2.4rem,6vw,5rem)] font-semibold">Pick a topic and dive in</h2>
        <div className="mt-12 flex flex-wrap gap-4">
          {categories.map((c) => (
            <Link key={c.name} to={`/blog?category=${encodeURIComponent(c.name)}`} className="glass group flex items-baseline gap-3 rounded-3xl px-7 py-5 transition-transform hover:-translate-y-1">
              <span className="font-display text-2xl font-semibold">{c.name}</span>
              <span className="text-ink/60">{c.count} {c.count === 1 ? 'article' : 'articles'}</span>
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-16 space-y-4">
        <Marquee duration="38s">{row.map(tagPill)}</Marquee>
        <Marquee duration="46s" reverse>{[...row].reverse().map(tagPill)}</Marquee>
      </div>
    </section>
  );
}

function Latest({ posts, loading }) {
  return (
    <section data-scene="dusk" className="relative z-10 py-28">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-[12ch] text-[clamp(2.4rem,6vw,5rem)] font-semibold">Fresh from the desk</h2>
          <Button asChild variant="glass"><Link to="/blog">All articles <ArrowRight size={16} /></Link></Button>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-[26rem]" />) : posts.map((p) => <PostCard key={p._id} post={p} />)}
        </div>
      </div>
    </section>
  );
}

function Newsletter() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api.subscribe(email);
      toast.success(r.message);
      setEmail('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section id="newsletter" data-scene="plum" className="relative z-10 py-28">
      <div className="container-x">
        <div className="glass relative mx-auto max-w-3xl rounded-[2rem] p-8 text-center sm:p-14">
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-semibold">Get new articles in your inbox</h2>
          <p className="mx-auto mt-4 max-w-[40ch] text-ink/70">One email when something is published. No tracking, no filler.</p>
          <form onSubmit={submit} className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row">
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" aria-label="Email address" />
            <Button type="submit" size="lg" className="h-12" disabled={busy}>{busy ? 'Joining…' : 'Subscribe'}</Button>
          </form>
          <BorderBeam duration={12} size={220} />
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [data, setData] = useState({ featured: [], latest: [], categories: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.posts.featured(), api.posts.list({ limit: 6 }), api.posts.categories()])
      .then(([f, l, c]) => setData({ featured: f.posts, latest: l.posts, categories: c.categories, total: l.total }))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const tags = [...new Set([...data.featured, ...data.latest].flatMap((p) => p.tags || []))].slice(0, 12);

  return (
    <>
      <Suspense fallback={null}><Scene /></Suspense>
      <Hero />
      <Featured posts={data.featured} loading={loading} />
      <Manifesto articles={data.total} topics={data.categories.length} />
      <Topics categories={data.categories} tags={tags} />
      <Latest posts={data.latest} loading={loading} />
      <Newsletter />
    </>
  );
}
