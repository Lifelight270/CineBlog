import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const empty = {
  title: '', excerpt: '', category: '', tags: '', coverImage: '',
  coverImageCredit: '', coverImageSource: '', content: '',
};
const MAX_COVER_BYTES = 256 * 1024;
const IMAGE_EXTENSIONS = /\.(apng|avif|bmp|gif|jpe?g|png|svg|webp)$/i;
const STOP_WORDS = new Set(['the', 'and', 'for', 'with', 'from', 'that', 'this', 'into', 'how', 'your', 'about']);

function imageTerms(value) {
  return [...new Set(value.toLowerCase().match(/[a-z0-9]{2,}/g) || [])]
    .filter((term) => !STOP_WORDS.has(term));
}

function scoreImage(page, priorities) {
  const name = page.title.replace(/^File:/i, '').replace(/[_-]/g, ' ').toLowerCase();
  const words = new Set(imageTerms(name));
  let score = 0;
  let hasStrongMatch = false;
  let titleMatches = 0;
  for (const { terms, weight, strong, title } of priorities) {
    const matches = terms.filter((term) => words.has(term));
    if (matches.length) {
      score += matches.length * weight;
      if (strong) hasStrongMatch = true;
      if (title) titleMatches += matches.length;
    }
  }
  return { score, relevant: hasStrongMatch || titleMatches >= 2 };
}

function compressCover(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      let width = image.naturalWidth;
      let height = image.naturalHeight;
      const scale = Math.min(1, 1600 / width, 1000 / height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) return reject(new Error('Could not process this image.'));

      const encode = (quality) => new Promise((done) => canvas.toBlob(done, 'image/jpeg', quality));
      (async () => {
        try {
          let blob;
          for (let resize = 0; resize < 5; resize += 1) {
            canvas.width = width;
            canvas.height = height;
            context.drawImage(image, 0, 0, width, height);
            for (const quality of [0.82, 0.68, 0.54, 0.4]) {
              blob = await encode(quality);
              if (!blob) throw new Error('Could not encode this image.');
              if (blob.size <= MAX_COVER_BYTES) break;
            }
            if (blob.size <= MAX_COVER_BYTES) break;
            width = Math.round(width * 0.8);
            height = Math.round(height * 0.8);
          }
          if (blob.size > MAX_COVER_BYTES) throw new Error('Image is too large to compress. Choose a smaller JPG.');
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error('Could not read this image.'));
          reader.readAsDataURL(blob);
        } catch (error) {
          reject(error);
        }
      })();
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not open this image.'));
    };
    image.src = objectUrl;
  });
}

function plainText(html) {
  const element = document.createElement('div');
  element.innerHTML = html;
  return element.textContent || '';
}

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [cats, setCats] = useState([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const [imageBusy, setImageBusy] = useState(false);
  const fileInput = useRef(null);

  useEffect(() => { api.posts.categories().then((d) => setCats(d.categories)).catch(() => {}); }, []);
  useEffect(() => {
    if (!id) return;
    api.posts.byId(id)
      .then(({ post }) => setForm({ ...empty, ...post, tags: (post.tags || []).join(', ') }))
      .catch((e) => { toast.error(e.message); navigate('/dashboard'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const chooseCover = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if ((file.type && !file.type.startsWith('image/')) || (!file.type && !IMAGE_EXTENSIONS.test(file.name))) {
      toast.error('Choose an image format supported by your browser.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error('Choose an image smaller than 15 MB.');
      return;
    }
    setImageBusy(true);
    try {
      const coverImage = await compressCover(file);
      setForm((f) => ({ ...f, coverImage, coverImageCredit: '', coverImageSource: '' }));
      toast.success('Cover image added and compressed.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setImageBusy(false);
    }
  };

  const findCover = async () => {
    const tags = (Array.isArray(form.tags) ? form.tags : String(form.tags || '').split(','))
      .map((tag) => tag.trim())
      .filter(Boolean);
    const priorities = [
      { terms: imageTerms(form.category), weight: 5, strong: true },
      ...tags.map((tag) => ({ terms: imageTerms(tag), weight: 4, strong: true })),
      { terms: imageTerms(form.title), weight: 1, title: true },
    ].filter(({ terms }) => terms.length);
    const query = [form.category, ...tags, form.title].filter(Boolean).join(' ').trim();
    if (!query) return toast.error('Enter a topic, title, or tag first.');
    setImageBusy(true);
    try {
      const params = new URLSearchParams({
        action: 'query',
        generator: 'search',
        gsrsearch: query,
        gsrnamespace: '6',
        gsrlimit: '30',
        prop: 'imageinfo',
        iiprop: 'url|extmetadata',
        iiurlwidth: '1400',
        format: 'json',
        origin: '*',
      });
      const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`);
      if (!response.ok) throw new Error('Wikimedia Commons image search failed.');
      const data = await response.json();
      const matches = Object.values(data.query?.pages || {})
        .map((candidate) => ({ ...candidate, relevance: scoreImage(candidate, priorities) }))
        .filter((candidate) => candidate.relevance.relevant && candidate.imageinfo?.[0]?.thumburl)
        .sort((a, b) => b.relevance.score - a.relevance.score);
      const currentSource = form.coverImageSource;
      const alternatives = matches.filter((candidate) =>
        `https://commons.wikimedia.org/wiki/${encodeURIComponent(candidate.title.replaceAll(' ', '_'))}` !== currentSource
      );
      const candidates = alternatives.length ? alternatives : matches;
      const bestMatches = candidates.slice(0, 5);
      const page = bestMatches[Math.floor(Math.random() * bestMatches.length)];
      if (!page) throw new Error('No relevant image found for this title, topic, or tags. Try adding more specific tags.');
      const info = page.imageinfo[0];
      const metadata = info.extmetadata || {};
      const artist = plainText(metadata.Artist?.value || '').trim();
      const license = plainText(metadata.LicenseShortName?.value || '').trim();
      const coverImageCredit = [artist, license].filter(Boolean).join(' · ') || 'Wikimedia Commons contributor';
      const coverImageSource = `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title.replaceAll(' ', '_'))}`;
      setForm((f) => ({ ...f, coverImage: info.thumburl, coverImageCredit, coverImageSource }));
      toast.success('A topic-matched cover image was selected.');
    } catch (error) {
      toast.error(error.message || 'Could not find a cover image.');
    } finally {
      setImageBusy(false);
    }
  };

  const save = async (published) => {
    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim()) return toast.error('Add a title, a short summary and some content first.');
    setBusy(true);
    try {
      const body = { ...form, published, category: form.category || 'General' };
      const { post } = id ? await api.posts.update(id, body) : await api.posts.create(body);
      toast.success(published ? 'Published.' : 'Draft saved.');
      navigate(published ? `/blog/${post.slug}` : '/dashboard');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <main className="container-x pt-40 text-ink/60">Loading article…</main>;

  return (
    <main className="container-x relative z-10 pb-24 pt-36">
      <h1 className="text-[clamp(2.4rem,6vw,4.5rem)] font-semibold">{id ? 'Edit article' : 'New article'}</h1>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2"><Label htmlFor="title">Title</Label><Input id="title" value={form.title} onChange={set('title')} maxLength={140} className="h-14 text-xl" /></div>
        <div className="md:col-span-2"><Label htmlFor="excerpt">Summary (shown on cards)</Label><Textarea id="excerpt" value={form.excerpt} onChange={set('excerpt')} maxLength={280} className="min-h-[84px]" /></div>
        <div>
          <Label htmlFor="category">Topic</Label>
          <Input id="category" list="topics" value={form.category} onChange={set('category')} placeholder="Design, Motion, WebGL…" />
          <datalist id="topics">{cats.map((c) => <option key={c.name} value={c.name} />)}</datalist>
        </div>
        <div><Label htmlFor="tags">Tags (comma separated)</Label><Input id="tags" value={form.tags} onChange={set('tags')} placeholder="gsap, css, react" /></div>
        <div className="md:col-span-2">
          <Label htmlFor="cover">Cover image (optional)</Label>
          <div className="mt-2 flex flex-wrap gap-3">
            <Button type="button" variant="glass" disabled={imageBusy} onClick={() => fileInput.current?.click()}>
              {imageBusy ? 'Processing image…' : 'Choose image from laptop'}
            </Button>
            <Button type="button" variant="glass" disabled={imageBusy} onClick={findCover}>Find automatically by topic</Button>
            <input ref={fileInput} type="file" accept="image/*" onChange={chooseCover} className="hidden" />
          </div>
          <p className="mt-2 text-sm text-ink/60">Browser-supported image formats are converted to compressed JPEG under 256 KB. Automatic matches are ranked by title, topic, and tags using Wikimedia Commons thumbnails.</p>
          <Input id="cover" value={form.coverImage.startsWith('data:') ? '' : form.coverImage} onChange={(event) => setForm((f) => ({ ...f, coverImage: event.target.value, coverImageCredit: '', coverImageSource: '' }))} placeholder="Or paste an image URL" className="mt-3" />
          {form.coverImage && <img src={form.coverImage} alt="Cover preview" className="mt-4 max-h-64 rounded-xl object-cover" />}
          {form.coverImageCredit && <p className="mt-2 text-sm text-ink/60">Image credit: {form.coverImageCredit}</p>}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <Label htmlFor="content">Content (Markdown)</Label>
          <Textarea id="content" value={form.content} onChange={set('content')} className="min-h-[460px] font-mono text-[0.95rem] leading-relaxed" placeholder={'## A heading\n\nWrite in **Markdown**.'} />
        </div>
        <div>
          <Label>Preview</Label>
          <div className="glass prose-post min-h-[460px] max-w-none overflow-auto rounded-xl p-6">
            {form.content.trim() ? <ReactMarkdown>{form.content}</ReactMarkdown> : <p className="text-ink/50">Your formatted article appears here as you type.</p>}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button size="lg" disabled={busy} onClick={() => save(true)}>{id ? 'Update and publish' : 'Publish'}</Button>
        <Button size="lg" variant="glass" disabled={busy} onClick={() => save(false)}>Save as draft</Button>
        <Button size="lg" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
      </div>
    </main>
  );
}
