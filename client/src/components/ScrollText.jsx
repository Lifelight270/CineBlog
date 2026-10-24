import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Big statement lines. As each line crosses the viewport it slides sideways
 * (alternating direction), its words light up in sequence, and the line's
 * colour travels from ink to the scene accent and back.
 */
export default function ScrollText({ lines }) {
  const root = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const mm = gsap.matchMedia();
      mm.add('(min-width: 0px)', () => {
        gsap.utils.toArray('[data-line]').forEach((line, i) => {
          const dir = i % 2 === 0 ? 1 : -1;
          const words = line.querySelectorAll('[data-word]');
          // GSAP can't tween rgb(var(--x)), so tween a 0..1 mix and let CSS blend ink -> accent.
          const mix = { m: 0 };
          const paint = () => { line.style.color = `color-mix(in srgb, rgb(var(--accent)) ${mix.m * 100}%, rgb(var(--ink)))`; };
          const tl = gsap.timeline({
            scrollTrigger: { trigger: line, start: 'top 92%', end: 'bottom 28%', scrub: 0.6 },
          });
          tl.fromTo(line, { xPercent: -14 * dir }, { xPercent: 10 * dir, ease: 'none', duration: 1 }, 0)
            .fromTo(words, { opacity: 0.14 }, { opacity: 1, stagger: 0.14, ease: 'none', duration: 0.5 }, 0)
            .to(mix, { m: 1, ease: 'none', duration: 0.5, onUpdate: paint }, 0.1)
            .to(mix, { m: 0, ease: 'none', duration: 0.4, onUpdate: paint }, 0.7);
        });
      });
    },
    { scope: root }
  );

  return (
    <div ref={root} className="overflow-hidden py-10">
      {lines.map((text, i) => (
        <div key={text} data-line className="whitespace-nowrap py-3 font-display text-[clamp(2.6rem,9vw,8rem)] font-semibold leading-[1.02] tracking-tight" style={{ textAlign: i % 2 ? 'right' : 'left', textShadow: '0 0 36px rgb(var(--bg) / 0.85), 0 2px 12px rgb(var(--bg) / 0.6)' }}>
          {text.split(' ').map((w, wi) => (
            <span key={wi} data-word className="inline-block pr-[0.28em]">{w}</span>
          ))}
        </div>
      ))}
    </div>
  );
}
