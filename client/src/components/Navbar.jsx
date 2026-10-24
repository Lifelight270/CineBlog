import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { Menu, X, PenLine, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/blog', label: 'Articles' },
  { to: '/about', label: 'About' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 160 && !open);
  });

  const linkClass = ({ isActive }) =>
    cn('relative rounded-full px-4 py-2 font-display text-sm font-medium transition-colors', isActive ? 'text-ink' : 'text-ink/65 hover:text-ink');

  return (
    <motion.header
      animate={{ y: hidden ? -110 : 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-4 z-50 px-4"
    >
      <nav className="glass-strong mx-auto flex max-w-4xl items-center justify-between rounded-full py-2 pl-5 pr-2" aria-label="Main">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
          <span className="h-3 w-3 rounded-full bg-accent shadow-[0_0_14px_rgb(var(--accent))]" aria-hidden />
          Cine Blog
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {({ isActive }) => (
                <>
                  {isActive && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-ink/12" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                  <span className="relative">{l.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              {isAdmin && (
                <>
                  <Button asChild size="sm" variant="glass"><Link to="/dashboard"><LayoutDashboard size={15} />Dashboard</Link></Button>
                  <Button asChild size="sm"><Link to="/write"><PenLine size={15} />Write</Link></Button>
                </>
              )}
              <Button size="icon" variant="ghost" aria-label="Sign out" onClick={() => { logout(); navigate('/'); }}><LogOut size={17} /></Button>
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost"><Link to="/login">Sign in</Link></Button>
              <Button asChild size="sm"><Link to="/register">Create account</Link></Button>
            </>
          )}
        </div>

        <Button size="icon" variant="ghost" className="md:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            className="glass-strong mx-auto mt-2 max-w-4xl rounded-3xl p-3 md:hidden"
            onClick={() => setOpen(false)}
          >
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className="block rounded-2xl px-4 py-3 font-display font-medium hover:bg-ink/10">{l.label}</NavLink>
            ))}
            {user ? (
              <>
                {isAdmin && (
                  <>
                    <Link to="/dashboard" className="block rounded-2xl px-4 py-3 font-display font-medium hover:bg-ink/10">Dashboard</Link>
                    <Link to="/write" className="block rounded-2xl px-4 py-3 font-display font-medium hover:bg-ink/10">Write an article</Link>
                  </>
                )}
                <button className="block w-full rounded-2xl px-4 py-3 text-left font-display font-medium hover:bg-ink/10" onClick={() => { logout(); navigate('/'); }}>Sign out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block rounded-2xl px-4 py-3 font-display font-medium hover:bg-ink/10">Sign in</Link>
                <Link to="/register" className="block rounded-2xl px-4 py-3 font-display font-medium hover:bg-ink/10">Create account</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
