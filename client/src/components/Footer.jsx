import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-ink/10">
      <div className="container-x flex flex-col items-start justify-between gap-6 py-10 sm:flex-row sm:items-center">
        <div>
          <p className="font-display text-lg font-semibold">Cine Blog</p>
          <p className="mt-1 text-base text-ink/60">The pulse of modern tech and code.</p>
        </div>
        <nav className="flex gap-6 font-display text-sm text-ink/70" aria-label="Footer">
          <Link className="hover:text-ink" to="/blog">Articles</Link>
          <Link className="hover:text-ink" to="/about">About</Link>
          <Link className="hover:text-ink" to="/login">Sign in</Link>
        </nav>
      </div>
    </footer>
  );
}
