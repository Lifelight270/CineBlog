import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

/** React Bits SplitText: characters rise into place one by one (GSAP). */
export default function SplitText({ text, className, delay = 0.03, as: Tag = 'h1' }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      gsap.from(ref.current.querySelectorAll('[data-char]'), {
        yPercent: 110,
        rotate: 6,
        opacity: 0,
        duration: 0.9,
        ease: 'expo.out',
        stagger: delay,
        delay: 0.2,
      });
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref} className={cn(className)} aria-label={text}>
      {text.split(' ').map((word, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap" aria-hidden>
          {word.split('').map((c, ci) => (
            <span key={ci} className="inline-block overflow-hidden align-bottom">
              <span data-char className="inline-block will-change-transform">{c}</span>
            </span>
          ))}
          <span className="inline-block">&nbsp;</span>
        </span>
      ))}
    </Tag>
  );
}
