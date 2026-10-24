import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Toaster } from 'sonner';
import SmoothScroll from '@/components/SmoothScroll';
import ScrollColorProvider from '@/components/ScrollColorProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import Home from '@/pages/Home';
import Blog from '@/pages/Blog';
import Post from '@/pages/Post';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Editor from '@/pages/Editor';
import NotFound from '@/pages/NotFound';
import About from '@/pages/About';

function InitialLoader() {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(false), reduceMotion ? 250 : 1450);
    return () => window.clearTimeout(timeout);
  }, [reduceMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="initial-loader"
          role="status"
          aria-label="Loading Afterglow"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(12px)' }}
          transition={{ duration: reduceMotion ? 0.15 : 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-surface"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 0.2, scale: 1 }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
              className="absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/30 blur-[110px]"
            />
            <motion.div
              initial={{ rotate: -35, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ink/10"
            />
          </div>

          <div className="relative flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-5xl font-semibold tracking-[-0.07em] sm:text-6xl"
            >
              Cine Blog<span className="text-accent">.</span>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.5 }}
              className="mt-3 font-display text-xs uppercase tracking-[0.32em] text-ink/55"
            >
             Beyond the Code
            </motion.p>
            <div className="mt-10 h-px w-40 overflow-hidden bg-ink/15">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: reduceMotion ? 0.15 : 1.05, ease: [0.65, 0, 0.35, 1] }}
                className="h-full origin-left bg-accent"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const { pathname } = useLocation();
  return (
    <>
      <InitialLoader />
      <SmoothScroll />
      <ScrollColorProvider />
      <Navbar />
      <Routes location={pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<Post />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="register" />} />
        <Route path="/dashboard" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
        <Route path="/write" element={<ProtectedRoute adminOnly><Editor /></ProtectedRoute>} />
        <Route path="/write/:id" element={<ProtectedRoute adminOnly><Editor /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      <Toaster position="bottom-right" toastOptions={{ className: '!glass-strong !text-ink !border-ink/20 !font-display' }} />
    </>
  );
}
