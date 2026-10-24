import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { live, setScene } from '@/lib/scenes';

gsap.registerPlugin(ScrollTrigger);

/**
 * Finds every [data-scene] element on the page and tweens the global palette
 * (surface / ink / accent) as each one crosses the middle of the viewport.
 */
export default function ScrollColorProvider() {
  const { pathname } = useLocation();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const scenes = gsap.utils.toArray('[data-scene]');
      if (!scenes.length) setScene('dusk');

      scenes.forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 55%',
          end: 'bottom 55%',
          onEnter: () => setScene(el.dataset.scene),
          onEnterBack: () => setScene(el.dataset.scene),
        });
      });

      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => { live.progress = self.progress; },
      });
    });

    // Content height changes when data arrives; keep trigger positions honest.
    let t;
    const ro = new ResizeObserver(() => {
      clearTimeout(t);
      t = setTimeout(() => ScrollTrigger.refresh(), 150);
    });
    ro.observe(document.body);
    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      clearTimeout(t);
      ro.disconnect();
      ctx.revert();
    };
  }, [pathname]);

  return null;
}
