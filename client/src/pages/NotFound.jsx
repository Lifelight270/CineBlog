import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="container-x relative z-10 grid min-h-screen place-items-center text-center">
      <div>
        <h1 className="text-[clamp(5rem,18vw,12rem)] font-semibold text-accent">404</h1>
        <p className="mt-2 text-xl text-ink/70">That page doesn't exist. It may have moved or never been written.</p>
        <Button asChild size="lg" className="mt-8"><Link to="/">Go to the homepage</Link></Button>
      </div>
    </main>
  );
}
