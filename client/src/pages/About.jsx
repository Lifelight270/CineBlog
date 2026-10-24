import { useEffect, useRef, useState } from 'react';
import {
  motion, MotionConfig, useMotionValue, useSpring, useTransform, useScroll,
} from 'motion/react';
import {
  ArrowUpRight, Github, Globe, Instagram, Linkedin, Mail, Phone, Upload, Trash2, ImagePlus,
} from 'lucide-react';
import { SCENES } from '@/lib/scenes';
import SplitText from '@/components/reactbits/split-text';
import Magnet from '@/components/reactbits/magnet';
import { Card3D } from '@/components/aceternity/card-3d';
import { TextGenerateEffect } from '@/components/aceternity/text-generate-effect';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

import './about.css';

// Make sure the pink scene exists even if lib/scenes.js was not updated.
if (!SCENES.rose) SCENES.rose = { bg: [28, 9, 20], ink: [255, 241, 246], accent: [255, 104, 158] };

const ease = [0.22, 1, 0.36, 1];

/* ----------------------------- content ----------------------------- */
const BIO =
  'I am a passionate full-stack developer with a strong focus on building practical and polished web applications. My expertise lies in creating seamless user interfaces, efficient back-end systems, and robust databases. I thrive on turning complex problems into elegant solutions, ensuring that every project I work on is both functional and visually appealing. With a keen eye for detail and a commitment to continuous learning, I am dedicated to delivering high-quality software that meets the needs of users and businesses alike.';

const socials = [
  { label: 'Portfolio', href: 'https://www.janaktharu.com.np/', icon: Globe },
  { label: 'GitHub', href: 'https://github.com/Lifelight270', icon: Github },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/janak270/', icon: Linkedin },
  { label: 'Instagram', href: 'https://www.instagram.com/janak_270t/?hl=en', icon: Instagram },
  { label: 'Email', href: 'mailto:lightlife908@gmail.com', icon: Mail },
  { label: '9826489186', href: 'tel:9826489186', icon: Phone },
];

const skillGroups = [
  { title: 'Front-end', items: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Bootstrap'] },
  { title: 'Back-end & data', items: ['MERN stack', 'Spring Boot', 'MySQL', 'PostgreSQL', 'Data analysis'] },
  { title: 'Workflow', items: ['Docker', 'Git', 'GitHub'] },
];

const projects = [
  { name: 'ChatApp', href: 'https://chatapp-p1zd.onrender.com', detail: 'A real-time chat application.', col: 'ab-col-4', bg: 'linear-gradient(135deg,#ff5f9e,#ff9a76)' },
  { name: 'Hotel Room Booking', href: 'https://hotel-room-book.vercel.app/', detail: 'An online hotel booking website.', col: 'ab-col-2', bg: 'linear-gradient(135deg,#e63e8b,#ff7a90)' },
  { name: 'Mini Task Tracker', href: 'https://mini-task-tracker-six.vercel.app/', detail: 'A task management app.', col: 'ab-col-2', bg: 'linear-gradient(135deg,#ff7eb3,#ffb199)' },
  { name: 'E-commerce', href: 'https://lifelight270.github.io/E-commerce/', detail: 'An online shopping experience.', col: 'ab-col-4', bg: 'linear-gradient(135deg,#ff8fa3,#ffc3a0)' },
];

/* --------------------------- photo storage -------------------------- */
const MAX_PHOTO_BYTES = 300 * 1024;

const toDataUrl = (file, max = 1000) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      const context = c.getContext('2d');
      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error('Could not process that image.'));
        return;
      }
      context.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      const encode = (quality) => new Promise((done) => c.toBlob(done, 'image/jpeg', quality));
      (async () => {
        try {
          let blob;
          for (let resize = 0; resize < 5; resize += 1) {
            for (const quality of [0.82, 0.68, 0.54, 0.4]) {
              blob = await encode(quality);
              if (!blob) throw new Error('Could not encode that image.');
              if (blob.size <= MAX_PHOTO_BYTES) break;
            }
            if (blob.size <= MAX_PHOTO_BYTES) break;
            c.width = Math.round(c.width * 0.8);
            c.height = Math.round(c.height * 0.8);
            context.drawImage(img, 0, 0, c.width, c.height);
          }
          if (blob.size > MAX_PHOTO_BYTES) throw new Error('Choose a smaller image; it could not be compressed enough.');
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error('Could not read that image.'));
          reader.readAsDataURL(blob);
        } catch (error) {
          reject(error);
        }
      })();
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read that image.')); };
    img.src = url;
  });

/* ----------------------------- pieces ------------------------------ */
function Portrait() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [src, setSrc] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const input = useRef(null);

  useEffect(() => {
    let active = true;
    api.about.profile()
      .then(({ photo }) => { if (active) setSrc(photo); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-9, 9]), { stiffness: 140, damping: 18 });
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 140, damping: 18 });

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => { mx.set(0); my.set(0); };

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return setError('Please choose an image file.');
    if (file.size > 15 * 1024 * 1024) return setError('Choose an image smaller than 15 MB.');
    setBusy(true);
    try {
      const data = await toDataUrl(file);
      const result = await api.about.updatePhoto(data);
      setSrc(result.photo);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const clear = async () => {
    setBusy(true);
    try {
      await api.about.removePhoto();
      setSrc('');
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ab-portrait">
      <div className="ab-frame-wrap">
        {/* <div className="ab-badge ab-badge--a ab-glass-strong">
          <span className="ab-dot" /> Open to internships
        </div> */}
        <div className="ab-badge ab-badge--b ab-glass-strong">React · TypeScript · REST</div>

        <motion.div
          className="ab-frame"
          style={{ rotateX, rotateY, transformPerspective: 1100 }}
          onMouseMove={onMove}
          onMouseLeave={reset}
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease }}
        >
          <div className="ab-ring" aria-hidden />
          <div className="ab-frame-inner">
            {src ? (
              <img className="ab-photo" src={src} alt="Portrait of Janak Bahadur Tharu" />
            ) : (
              <div className="ab-empty">
                <span className="ab-initials">JT</span>
                {isAdmin && <span className="ab-add"><ImagePlus size={16} /> Add your photo</span>}
              </div>
            )}
            <div className="ab-shade" aria-hidden />
          </div>
        </motion.div>
      </div>

      {isAdmin && (
        <div className="ab-controls">
          <input ref={input} className="ab-file" type="file" accept="image/*" onChange={pick} aria-label="Choose a photo from your device" tabIndex={-1} />
          <button type="button" className="ab-btn ab-glass" disabled={busy} onClick={() => input.current?.click()}>
            <Upload size={16} /> {busy ? 'Saving…' : src ? 'Change photo' : 'Choose photo'}
          </button>
          {src && (
            <button type="button" className="ab-btn ab-btn--icon ab-btn--danger ab-glass" disabled={busy} onClick={clear} aria-label="Remove photo">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )}
      {error && <p role="alert" className="ab-error">{error}</p>}
    </div>
  );
}

function Social({ label, href, icon: Icon }) {
  const external = href.startsWith('http');
  return (
    <Magnet padding={36} strength={4}>
      <motion.a
        className="ab-social ab-glass"
        href={href}
        aria-label={label}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
        variants={{ hidden: { opacity: 0, scale: 0.5, y: 16 }, show: { opacity: 1, scale: 1, y: 0 } }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.92 }}
      >
        <Icon size={22} strokeWidth={1.8} />
        <span className="ab-tip ab-glass-strong">{label}</span>
      </motion.a>
    </Magnet>
  );
}

function Heading({ n, title }) {
  return (
    <motion.div
      className="ab-head"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -80px 0px' }}
      transition={{ duration: 0.7, ease }}
    >
      <span className="ab-num">{n}</span>
      <h2 className="ab-title">{title}</h2>
      <motion.span
        className="ab-line"
        aria-hidden
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease }}
      />
    </motion.div>
  );
}

function ProjectCard({ p, i }) {
  const host = new URL(p.href).hostname.replace(/^www\./, '');
  return (
    <motion.div
      className={`ab-pcol ${p.col}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      transition={{ duration: 0.8, delay: (i % 2) * 0.1, ease }}
    >
      <Card3D intensity={7}>
        <a className="ab-project ab-glass" href={p.href} target="_blank" rel="noreferrer">
          <div className="ab-pv" style={{ background: p.bg }}>
            <div className="ab-pv-shine" aria-hidden />
            <span className="ab-pv-num" aria-hidden>{String(i + 1).padStart(2, '0')}</span>
            <div className="ab-browser" data-depth>
              <div className="ab-browser-bar"><i /><i /><i /><span>{host}</span></div>
              <div className="ab-browser-body"><div className="ab-bar ab-bar--1" /><div className="ab-bar ab-bar--2" /></div>
            </div>
          </div>
          <div className="ab-pbody">
            <div>
              <h3>{p.name}</h3>
              <p>{p.detail}</p>
            </div>
            <span className="ab-arrow"><ArrowUpRight size={20} /></span>
          </div>
        </a>
      </Card3D>
    </motion.div>
  );
}

/* ------------------------------ page ------------------------------- */
export default function About() {
  const { scrollY } = useScroll();
  const lightY = useTransform(scrollY, [0, 2000], [0, -320]);

  return (
    <MotionConfig reducedMotion="user">
      <main data-scene="rose" className="ab">
        <div className="ab-bg" aria-hidden>
          <motion.div style={{ y: lightY, position: 'absolute', inset: 0 }}>
            <div className="ab-blob ab-blob--pink" />
          </motion.div>
          <div className="ab-blob ab-blob--peach" />
          <div className="ab-grain" />
        </div>

        <div className="ab-wrap">
          <section className="ab-hero">
            <div>
              <SplitText text="Janak Bahadur Tharu" className="ab-name" />
              <motion.p
                className="ab-role"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.7, ease }}
              >
                Full-Stack Developer
              </motion.p>
              <motion.p
                className="ab-tagline"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.05, duration: 0.7, ease }}
              >
                I build practical, polished web apps, from the interface down to the database.
              </motion.p>
              <motion.nav
                className="ab-socials"
                aria-label="Social links"
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 1.25 } } }}
              >
                {socials.map((s) => <Social key={s.label} {...s} />)}
              </motion.nav>
            </div>
            <Portrait />
          </section>

          <section className="ab-section">
            <Heading n="01" title="About" />
            <TextGenerateEffect words={BIO} className="ab-bio" />
            <motion.p
              className="ab-edu"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.6 }}
              viewport={{ once: true }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              B.E. in Computer Engineering, Lumbini Engineering College.
            </motion.p>
          </section>

          <section className="ab-section">
            <Heading n="02" title="Skills" />
            <div className="ab-skills">
              {skillGroups.map((g, gi) => (
                <motion.div
                  key={g.title}
                  className="ab-card ab-glass"
                  initial={{ opacity: 0, y: 36 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '0px 0px -60px 0px' }}
                  transition={{ duration: 0.7, delay: gi * 0.1, ease }}
                >
                  <h3>{g.title}</h3>
                  <ul className="ab-chips">
                    {g.items.map((s, si) => (
                      <motion.li
                        key={s}
                        className="ab-chip"
                        initial={{ opacity: 0, scale: 0.7 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.25 + gi * 0.1 + si * 0.05 }}
                        whileHover={{ y: -3, scale: 1.05 }}
                      >
                        {s}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="ab-section">
            <Heading n="03" title="Projects" />
            <div className="ab-projects">
              {projects.map((p, i) => <ProjectCard key={p.name} p={p} i={i} />)}
            </div>
          </section>
        </div>
      </main>
    </MotionConfig>
  );
}